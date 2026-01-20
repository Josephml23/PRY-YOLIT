import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import api from '@/services/api';

interface Documento {
  id: number;
  nombre_archivo: string;
  tipo: string;
  size: number;
  mime_type: string;
  storage_path: string;
  descripcion?: string;
  created_at: string;
  usuario?: {
    name: string;
  };
}

interface GestionDocumentosProps {
  oportunidadId: number;
  documentos: Documento[];
  onDocumentosChange: () => void;
}

const TIPOS_DOCUMENTO = [
  { value: 'TDR', label: 'TDR - Términos de Referencia' },
  { value: 'OC', label: 'OC - Orden de Compra' },
  { value: 'SIAF', label: 'SIAF - Comprobante SIAF' },
  { value: 'CONFORMIDAD', label: 'Conformidad' },
  { value: 'ENTREGABLE', label: 'Entregable' },
  { value: 'PAGO', label: 'Comprobante de Pago' },
  { value: 'CONTRATO', label: 'Contrato' },
  { value: 'ACTA', label: 'Acta de Reunión' },
  { value: 'OTRO', label: 'Otro' },
];

export default function GestionDocumentos({ 
  oportunidadId, 
  documentos, 
  onDocumentosChange 
}: GestionDocumentosProps) {
  const [uploading, setUploading] = useState(false);
  const [tipoSeleccionado, setTipoSeleccionado] = useState('OTRO');
  const [descripcion, setDescripcion] = useState('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    const file = acceptedFiles[0];

    try {
      const formData = new FormData();
      formData.append('archivo', file);
      formData.append('oportunidad_id', oportunidadId.toString());
      formData.append('tipo', tipoSeleccionado);
      if (descripcion) {
        formData.append('descripcion', descripcion);
      }

      await api.post('/v1/documentos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Documento subido exitosamente');
      setDescripcion('');
      onDocumentosChange();
    } catch (error) {
      console.error('Error al subir documento:', error);
      toast.error('Error al subir el documento');
    } finally {
      setUploading(false);
    }
  }, [oportunidadId, tipoSeleccionado, descripcion, onDocumentosChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    disabled: uploading,
  });

  const handleDescargar = async (documento: Documento) => {
    try {
      const response = await api.get(`/v1/documentos/${documento.id}/descargar`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', documento.nombre_archivo);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Documento descargado');
    } catch (error) {
      console.error('Error al descargar:', error);
      toast.error('Error al descargar el documento');
    }
  };

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este documento?')) return;

    try {
      await api.delete(`/v1/documentos/${id}`);
      toast.success('Documento eliminado');
      onDocumentosChange();
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('Error al eliminar el documento');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1048576) {
      return (bytes / 1048576).toFixed(2) + ' MB';
    } else if (bytes >= 1024) {
      return (bytes / 1024).toFixed(2) + ' KB';
    }
    return bytes + ' bytes';
  };

  return (
    <div className="space-y-4">
      {/* Formulario de subida */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2 mb-4">
            <div>
              <Label>Tipo de Documento</Label>
              <Select value={tipoSeleccionado} onValueChange={setTipoSeleccionado}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_DOCUMENTO.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Descripción (opcional)</Label>
              <Input
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Breve descripción del documento"
              />
            </div>
          </div>

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            {uploading ? (
              <p className="text-sm text-muted-foreground">Subiendo archivo...</p>
            ) : isDragActive ? (
              <p className="text-sm text-primary font-medium">Suelta el archivo aquí</p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-2">
                  Arrastra un archivo aquí o haz clic para seleccionar
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, Word, Excel, imágenes (máx. 10MB)
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de documentos */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4">
            Documentos Adjuntos ({documentos.length})
          </h3>

          {documentos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No hay documentos adjuntos</p>
            </div>
          ) : (
            <div className="space-y-2">
              {documentos.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="h-5 w-5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.nombre_archivo}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium text-primary">{doc.tipo}</span>
                        <span>•</span>
                        <span>{formatFileSize(doc.size)}</span>
                        <span>•</span>
                        <span>{new Date(doc.created_at).toLocaleDateString('es-PE')}</span>
                        {doc.usuario && (
                          <>
                            <span>•</span>
                            <span>{doc.usuario.name}</span>
                          </>
                        )}
                      </div>
                      {doc.descripcion && (
                        <p className="text-xs text-muted-foreground mt-1">{doc.descripcion}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDescargar(doc)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEliminar(doc.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
