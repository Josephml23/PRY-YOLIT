import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Mic, MicOff, Send, Volume2, Sparkles, CheckCircle2, XCircle, FileText, Loader2, VolumeX, Printer, Download, X } from 'lucide-react';
import api from '@/services/api';
import { NubofactHeader } from '@/components/layout/NubofactHeader';

interface Item {
  codigo: string;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  igv: number;
  total: number;
}

interface Intencion {
  tipo_comprobante_nombre: string;
  tipo_comprobante_sunat: string;
  serie: string;
  numero: number;
  cliente_denominacion: string;
  cliente_numero_de_documento: string;
  total_gravada: number;
  total_igv: number;
  total: number;
  items: Item[];
  texto_original: string;
}

interface ProcessResponse {
  conversacion_id: number;
  estado: string;
  transcripcion: string;
  asistente_respuesta: string;
  intencion?: Intencion;
  tiempo_procesamiento_ms: number;
  tts?: {
    audio_base64?: string | null;
    usar_web_speech_api?: boolean;
  };
}

interface ChatLog {
  role: 'user' | 'assistant';
  text: string;
}

const numeroALetras = (num: number): string => {
  const Unidades = (n: number) => {
    switch (n) {
      case 1: return 'UN';
      case 2: return 'DOS';
      case 3: return 'TRES';
      case 4: return 'CUATRO';
      case 5: return 'CINCO';
      case 6: return 'SEIS';
      case 7: return 'SIETE';
      case 8: return 'OCHO';
      case 9: return 'NUEVE';
    }
    return '';
  };

  const Decenas = (n: number) => {
    let decena = Math.floor(n / 10);
    let unidad = n % 10;
    switch (decena) {
      case 1:
        switch (unidad) {
          case 0: return 'DIEZ';
          case 1: return 'ONCE';
          case 2: return 'DOCE';
          case 3: return 'TRECE';
          case 4: return 'CATORCE';
          case 5: return 'QUINCE';
          default: return 'DIECI' + Unidades(unidad);
        }
      case 2:
        if (unidad === 0) return 'VEINTE';
        return 'VEINTI' + Unidades(unidad);
      case 3: return 'TREINTA' + (unidad > 0 ? ' Y ' + Unidades(unidad) : '');
      case 4: return 'CUARENTA' + (unidad > 0 ? ' Y ' + Unidades(unidad) : '');
      case 5: return 'CINCUENTA' + (unidad > 0 ? ' Y ' + Unidades(unidad) : '');
      case 6: return 'SESENTA' + (unidad > 0 ? ' Y ' + Unidades(unidad) : '');
      case 7: return 'SETENTA' + (unidad > 0 ? ' Y ' + Unidades(unidad) : '');
      case 8: return 'OCHENTA' + (unidad > 0 ? ' Y ' + Unidades(unidad) : '');
      case 9: return 'NOVENTA' + (unidad > 0 ? ' Y ' + Unidades(unidad) : '');
      case 0: return Unidades(unidad);
    }
    return '';
  };

  const Centenas = (n: number) => {
    let centena = Math.floor(n / 100);
    let dezenas = n % 100;
    switch (centena) {
      case 1:
        if (dezenas > 0) return 'CIENTO ' + Decenas(dezenas);
        return 'CIEN';
      case 2: return 'DOSCIENTOS ' + Decenas(dezenas);
      case 3: return 'TRESCIENTOS ' + Decenas(dezenas);
      case 4: return 'CUATROCIENTOS ' + Decenas(dezenas);
      case 5: return 'QUINIENTOS ' + Decenas(dezenas);
      case 6: return 'SEISCIENTOS ' + Decenas(dezenas);
      case 7: return 'SETECIENTOS ' + Decenas(dezenas);
      case 8: return 'OCHOCIENTOS ' + Decenas(dezenas);
      case 9: return 'NOVECIENTOS ' + Decenas(dezenas);
      case 0: return Decenas(dezenas);
    }
    return '';
  };

  const Seccion = (num: number, divisor: number, strSingular: string, strPlural: string) => {
    let cientos = Math.floor(num / divisor);
    let resto = num % divisor;
    let letras = '';

    if (cientos > 0) {
      if (cientos > 1) {
        letras = Centenas(cientos) + ' ' + strPlural;
      } else {
        letras = strSingular;
      }
    }
    if (resto > 0) {
      letras += (letras !== '' ? ' ' : '') + Centenas(resto);
    }
    return letras;
  };

  const Miles = (num: number) => {
    let divisor = 1000;
    let cientos = Math.floor(num / divisor);
    let resto = num % divisor;
    let strMiles = Seccion(cientos, 1, 'UN MIL', 'MIL');
    let strCentenas = Centenas(resto);

    if (strMiles === '') return strCentenas;
    return strMiles + ' ' + strCentenas;
  };

  const Millones = (num: number) => {
    let divisor = 1000000;
    let cientos = Math.floor(num / divisor);
    let resto = num % divisor;
    let strMillones = Seccion(cientos, 1, 'UN MILLON', 'MILLONES');
    let strMiles = Miles(resto);

    if (strMillones === '') return strMiles;
    return strMillones + ' ' + strMiles;
  };

  let entero = Math.floor(num);
  let centavos = Math.round((num - entero) * 100);
  let letrasEntero = entero === 0 ? 'CERO' : Millones(entero);
  let strCentavos = (centavos < 10 ? '0' : '') + centavos;
  
  return `${letrasEntero} Y ${strCentavos}/100`;
};

interface InvoicePrintModalProps {
  invoice: any;
  onClose: () => void;
  shouldAutoPrint?: boolean;
}

function InvoicePrintModal({ invoice, onClose, shouldAutoPrint }: InvoicePrintModalProps) {
  if (!invoice) return null;

  useEffect(() => {
    if (shouldAutoPrint) {
      const timer = setTimeout(() => {
        window.print();
        onClose();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [shouldAutoPrint, invoice]);

  const handlePrint = () => {
    window.print();
  };

  const getTipoDocNombre = (tipo: string) => {
    return tipo === '01' ? 'FACTURA ELECTRÓNICA' : 'BOLETA DE VENTA ELECTRÓNICA';
  };

  const formatDocumento = (tipo: string) => {
    return tipo === '6' ? 'R.U.C.' : 'D.N.I.';
  };

  const getMonedaNombre = (cod: string) => {
    return cod === 'PEN' ? 'NUEVOS SOLES' : 'DÓLARES AMERICANOS';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs overflow-y-auto p-4 print:p-0 print:bg-white print:static print:overflow-visible">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 21cm;
            min-height: 29.7cm;
            padding: 1.5cm;
            margin: 0;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col h-[90vh] print:h-auto print:max-w-none print:shadow-none print:rounded-none no-print:animate-in no-print:zoom-in-95 duration-200">
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" />
            <span className="font-bold text-slate-800">Representación Impresa del Comprobante</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 border-slate-300">
              <Printer className="h-4 w-4 text-slate-600" /> Imprimir
            </Button>
            {invoice.pdf_url || invoice.enlace_pdf || invoice.enlace_del_pdf ? (
              <a 
                href={invoice.pdf_url || invoice.enlace_pdf || invoice.enlace_del_pdf} 
                target="_blank" 
                rel="noreferrer"
              >
                <Button variant="outline" size="sm" className="gap-2 border-slate-300">
                  <Download className="h-4 w-4 text-slate-600" /> Descargar PDF
                </Button>
              </a>
            ) : null}
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-200">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-100 print:bg-white print:overflow-visible print:p-0">
          <div className="print-area bg-white border border-slate-300 shadow-lg mx-auto p-12 max-w-[21cm] min-h-[29.7cm] text-black font-sans text-xs print:shadow-none print:border-none print:p-0">
            
            <div className="grid grid-cols-12 gap-4 mb-6">
              <div className="col-span-7 space-y-1">
                <div className="text-sm font-extrabold tracking-wider text-slate-900 uppercase">
                  {invoice.empresa?.nombre_comercial || invoice.empresa?.razon_social || 'EMPRESA EMISORA'}
                </div>
                <div className="font-bold text-[10px] text-slate-700 leading-tight uppercase">
                  {invoice.empresa?.razon_social || 'RAZON SOCIAL S.A.C.'}
                </div>
                <div className="text-[9px] text-slate-600 leading-tight">
                  {invoice.empresa?.direccion || 'DIRECCION FISCAL EMISOR'}<br />
                  {invoice.empresa?.ubigeo_departamento || 'LIMA'} - {invoice.empresa?.ubigeo_provincia || 'LIMA'} - {invoice.empresa?.ubigeo_distrito || 'LIMA'}
                </div>
              </div>

              <div className="col-span-5 border-2 border-black p-4 text-center space-y-2 flex flex-col justify-center">
                <div className="text-xs font-black tracking-widest text-black">
                  {getTipoDocNombre(invoice.tipo_doc)}
                </div>
                <div className="text-sm font-black text-black">
                  RUC: {invoice.empresa?.ruc || '00000000000'}
                </div>
                <div className="text-sm font-black text-black">
                  {invoice.serie || 'F001'}-{invoice.correlativo || '0000'}
                </div>
              </div>
            </div>

            <div className="border border-black p-4 space-y-1.5 mb-6">
              <div className="grid grid-cols-12 gap-x-2">
                <div className="col-span-3 font-bold">Fecha de Vencimiento</div>
                <div className="col-span-9">: {invoice.fecha_vencimiento || invoice.fecha_emision}</div>
              </div>
              <div className="grid grid-cols-12 gap-x-2">
                <div className="col-span-3 font-bold">Fecha de Emisión</div>
                <div className="col-span-9">: {invoice.fecha_emision}</div>
              </div>
              <div className="grid grid-cols-12 gap-x-2">
                <div className="col-span-3 font-bold">Señor(es)</div>
                <div className="col-span-9 uppercase font-bold">: {invoice.cliente_razon_social}</div>
              </div>
              <div className="grid grid-cols-12 gap-x-2">
                <div className="col-span-3 font-bold">{formatDocumento(invoice.cliente_tipo_doc)}</div>
                <div className="col-span-9 font-bold">: {invoice.cliente_num_doc}</div>
              </div>
              <div className="grid grid-cols-12 gap-x-2">
                <div className="col-span-3 font-bold">Dirección del Cliente</div>
                <div className="col-span-9 uppercase">: {invoice.cliente_direccion || 'SIN DIRECCION'}</div>
              </div>
              <div className="grid grid-cols-12 gap-x-2">
                <div className="col-span-3 font-bold">Tipo de Moneda</div>
                <div className="col-span-9 uppercase">: {getMonedaNombre(invoice.codigo_tipo_moneda)}</div>
              </div>
              {invoice.observaciones && (
                <div className="grid grid-cols-12 gap-x-2">
                  <div className="col-span-3 font-bold">Observación</div>
                  <div className="col-span-9">: {invoice.observaciones}</div>
                </div>
              )}
            </div>

            <div className="border border-black min-h-[250px] flex flex-col mb-6">
              <table className="w-full text-[10px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-black bg-slate-50 font-bold">
                    <th className="p-2 border-r border-black text-center w-16">Cantidad</th>
                    <th className="p-2 border-r border-black text-center w-24">Unidad Medida</th>
                    <th className="p-2 border-r border-black w-28">Código</th>
                    <th className="p-2 border-r border-black">Descripción</th>
                    <th className="p-2 text-right w-32">Valor Unitario</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items && invoice.items.map((item: any, idx: number) => (
                    <tr key={idx} className="border-b border-slate-200 last:border-b-0">
                      <td className="p-2 border-r border-black text-center font-bold">
                        {parseFloat(item.cantidad).toFixed(2)}
                      </td>
                      <td className="p-2 border-r border-black text-center uppercase">
                        {item.unidad === 'NIU' || item.unidad === 'NIU ' ? 'UNIDAD' : (item.unidad || 'UNIDAD')}
                      </td>
                      <td className="p-2 border-r border-black uppercase font-mono text-[9px]">
                        {item.codigo_producto || '-'}
                      </td>
                      <td className="p-2 border-r border-black uppercase font-semibold">
                        {item.descripcion}
                      </td>
                      <td className="p-2 text-right font-bold">
                        S/. {parseFloat(item.mto_precio_unitario || item.mto_valor_unitario || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {(!invoice.items || invoice.items.length < 5) && (
                    <tr className="h-24">
                      <td className="border-r border-black"></td>
                      <td className="border-r border-black"></td>
                      <td className="border-r border-black"></td>
                      <td className="border-r border-black"></td>
                      <td></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-7 space-y-4">
                <div className="border border-black p-2 text-[10px]">
                  Valor de Venta de Operaciones Gratuitas : S/. {parseFloat(invoice.mto_oper_gratuitas || 0).toFixed(2)}
                </div>
                <div className="font-extrabold text-[10px] uppercase text-black">
                  SON: {numeroALetras(parseFloat(invoice.mto_imp_venta))} {getMonedaNombre(invoice.codigo_tipo_moneda)}
                </div>
              </div>

              <div className="col-span-5 border border-black overflow-hidden">
                <table className="w-full text-[10px] border-collapse">
                  <tbody className="divide-y divide-slate-200">
                    <tr className="flex justify-between p-1">
                      <td className="font-bold">Sub Total Ventas</td>
                      <td className="font-bold">S/. {parseFloat(invoice.mto_oper_gravadas || 0).toFixed(2)}</td>
                    </tr>
                    <tr className="flex justify-between p-1">
                      <td>Anticipos</td>
                      <td>S/. 0.00</td>
                    </tr>
                    <tr className="flex justify-between p-1">
                      <td>Descuentos</td>
                      <td>S/. {parseFloat(invoice.total_descuentos || 0).toFixed(2)}</td>
                    </tr>
                    <tr className="flex justify-between p-1">
                      <td>Valor Venta</td>
                      <td>S/. {parseFloat(invoice.mto_oper_gravadas || 0).toFixed(2)}</td>
                    </tr>
                    <tr className="flex justify-between p-1">
                      <td>ISC</td>
                      <td>S/. 0.00</td>
                    </tr>
                    <tr className="flex justify-between p-1 bg-slate-50">
                      <td className="font-bold">IGV (18%)</td>
                      <td className="font-bold">S/. {parseFloat(invoice.mto_igv || 0).toFixed(2)}</td>
                    </tr>
                    <tr className="flex justify-between p-1">
                      <td>Otros Cargos</td>
                      <td>S/. {parseFloat(invoice.mto_otros_cargos || 0).toFixed(2)}</td>
                    </tr>
                    <tr className="flex justify-between p-1">
                      <td>Otros Tributos</td>
                      <td>S/. 0.00</td>
                    </tr>
                    <tr className="flex justify-between p-1.5 bg-slate-100 border-t border-black">
                      <td className="font-black text-black">Importe Total</td>
                      <td className="font-black text-black">S/. {parseFloat(invoice.mto_imp_venta || 0).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border border-black p-3 text-center text-[9px] mt-6 leading-tight text-slate-800 uppercase font-medium">
              Esta es una representación impresa de la factura electrónica, generada en el Sistema de SUNAT. Puede verificarla utilizando su clave SOL.
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default function VoiceIA() {
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmitting, setIsEmitting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [session, setSession] = useState<ProcessResponse | null>(null);
  const [editableIntencion, setEditableIntencion] = useState<Intencion | null>(null);
  const [emittedInvoice, setEmittedInvoice] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'asistente' | 'historial'>('asistente');
  const [historial, setHistorial] = useState<any[]>([]);
  const [historialLoading, setHistorialLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [shouldAutoPrint, setShouldAutoPrint] = useState(false);

  const handlePdfClick = (id: number) => {
    setShouldAutoPrint(true);
    fetchComprobanteEmitido(id);
  };

  const fetchComprobanteEmitido = async (id: number) => {
    try {
      const response = await api.get(`/facturacion/comprobantes/${id}`);
      if (response.data && response.data.comprobante) {
        setEmittedInvoice(response.data.comprobante);
      }
    } catch (err) {
      console.error('Error al obtener comprobante emitido:', err);
      toast.error('Comprobante emitido pero no se pudo cargar la vista de impresión.');
    }
  };

  const fetchHistorial = async (page = 1) => {
    setHistorialLoading(true);
    try {
      const response = await api.get(`/facturacion/comprobantes?page=${page}&per_page=10`);
      if (response.data && response.data.data) {
        setHistorial(response.data.data);
        setCurrentPage(response.data.current_page);
        setTotalPages(response.data.last_page);
      }
    } catch (err) {
      console.error('Error al cargar historial:', err);
      toast.error('No se pudo cargar el historial de comprobantes.');
    } finally {
      setHistorialLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorial(1);
  }, []);

  useEffect(() => {
    if (activeTab === 'historial') {
      fetchHistorial(1);
    }
  }, [activeTab]);
  const [chatLogs, setChatLogs] = useState<ChatLog[]>([
    {
      role: 'assistant',
      text: '¡Hola! Soy tu Asistente de Facturación por Voz. Presiona el micrófono y dictame: "Emitir factura para Fibertel por 2 Routers Mikrotik a 150 soles".',
    },
  ]);

  useEffect(() => {
    if (session && session.intencion) {
      setEditableIntencion(JSON.parse(JSON.stringify(session.intencion)));
    } else {
      setEditableIntencion(null);
    }
  }, [session]);

  const handleRucSearch = async (cleanVal: string) => {
    if (!cleanVal) {
      toast.warning('Ingresa un número de documento.');
      return;
    }
    try {
      const res = await api.get(`/v1/entidades?search=${cleanVal}`);
      if (res.data && res.data.length > 0) {
        const matched = res.data[0];
        setEditableIntencion(prev => {
          if (!prev) return null;
          const updatedCliente = {
            ...prev.cliente,
            id: matched.id,
            tipo_doc: matched.tipo_doc,
            num_doc: matched.num_doc,
            razon_social: matched.denominacion,
            direccion: matched.direccion,
            email: matched.email,
          };
          return {
            ...prev,
            cliente_denominacion: matched.denominacion,
            cliente_numero_de_documento: matched.num_doc,
            cliente: updatedCliente
          };
        });
        toast.success('Empresa encontrada en la BD.');
      } else {
        toast.warning('Documento no registrado localmente. Puedes ingresarlo manualmente.');
      }
    } catch (error) {
      console.error('Error buscando RUC:', error);
      toast.error('Error al consultar el documento.');
    }
  };

  const handleRucChange = async (val: string) => {
    if (!editableIntencion) return;
    const cleanVal = val.replace(/[^A-Za-z0-9]/g, '');
    
    setEditableIntencion(prev => prev ? { ...prev, cliente_numero_de_documento: cleanVal } : null);

    if (cleanVal.length === 11 || cleanVal.length === 8) {
      handleRucSearch(cleanVal);
    }
  };

  const handleItemChange = (idx: number, field: string, value: any) => {
    if (!editableIntencion) return;
    const updatedItems = [...editableIntencion.items];
    
    if (field === 'cantidad') {
      updatedItems[idx].cantidad = Math.max(1, parseInt(value) || 1);
    } else if (field === 'precio_unitario') {
      updatedItems[idx].precio_unitario = Math.max(0, parseFloat(value) || 0);
    } else if (field === 'descripcion') {
      updatedItems[idx].descripcion = value;
    }

    const item = updatedItems[idx];
    item.total = item.cantidad * item.precio_unitario;
    item.subtotal = item.total / 1.18;
    item.igv = item.total - item.subtotal;

    const total = updatedItems.reduce((acc, curr) => acc + curr.total, 0);
    const total_gravada = total / 1.18;
    const total_igv = total - total_gravada;

    setEditableIntencion(prev => prev ? {
      ...prev,
      items: updatedItems,
      total: total,
      total_gravada: total_gravada,
      total_igv: total_igv
    } : null);
  };

  const recognitionRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const sessionRef = useRef<ProcessResponse | null>(null);

  // Mantener la sesión sincronizada para callbacks
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLogs, isLoading, isListening]);

  useEffect(() => {
    isMountedRef.current = true;

    // Inicializar Web Speech Recognition API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // Se detiene al terminar la frase
      recognition.interimResults = true; // Transcripción en tiempo real mientras hablas
      recognition.lang = 'es-PE'; // Idioma

      recognition.onstart = () => {
        if (isMountedRef.current) setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (isMountedRef.current) {
          setInputText(currentTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Error en reconocimiento de voz:', event.error);
        if (isMountedRef.current) {
          setIsListening(false);
          if (event.error !== 'no-speech') {
            toast.error('Error al escuchar el micrófono.');
          }
        }
      };

      recognition.onend = () => {
        if (isMountedRef.current) {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    } else {
      toast.warning('Tu navegador no soporta transcripción en vivo. Usa Google Chrome o Edge.');
    }

    return () => {
      isMountedRef.current = false;
      detenerVoz();
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const hablarWebSpeech = useCallback((texto: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(texto);
      utterance.lang = 'es-PE';
      utterance.rate = 1.0;
      utterance.onstart = () => isMountedRef.current && setIsSpeaking(true);
      utterance.onend = () => isMountedRef.current && setIsSpeaking(false);
      utterance.onerror = () => isMountedRef.current && setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const detenerVoz = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      audioPlayerRef.current = null;
    }
    if (isMountedRef.current) {
      setIsSpeaking(false);
    }
  }, []);

  const reproducirVozAsistente = useCallback((texto: string, audioBase64?: string | null) => {
    detenerVoz();

    if (audioBase64) {
      const src = audioBase64.startsWith('data:') 
        ? audioBase64 
        : `data:audio/mp3;base64,${audioBase64}`;

      const audio = new Audio(src);
      audioPlayerRef.current = audio;
      setIsSpeaking(true);
      
      audio.onended = () => isMountedRef.current && setIsSpeaking(false);
      audio.onerror = () => {
        if (isMountedRef.current) setIsSpeaking(false);
        hablarWebSpeech(texto);
      };

      audio.play().catch(() => hablarWebSpeech(texto));
      return;
    }

    hablarWebSpeech(texto);
  }, [detenerVoz, hablarWebSpeech]);

  // 🎤 INICIAR / DETENER ESCUCHA EN VIVO
  const toggleListening = () => {
    detenerVoz();
    if (!recognitionRef.current) {
      toast.error('El reconocimiento de voz no está disponible en este navegador.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setInputText('');
      try {
        recognitionRef.current.start();
      } catch (err) {
        recognitionRef.current.stop();
      }
    }
  };

  // 📝 ENVÍA EL TEXTO YA TRANCRITO DIRECTAMENTE A LA IA
  const enviarTexto = async (textoAEnviar?: string) => {
    const texto = textoAEnviar || inputText;
    if (!texto.trim()) return;

    detenerVoz();
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setIsLoading(true);
    setChatLogs((prev) => [...prev, { role: 'user', text: texto }]);

    try {
      const payload: { texto: string; conversacion_id?: number } = { texto };
      if (sessionRef.current?.conversacion_id) {
        payload.conversacion_id = sessionRef.current.conversacion_id;
      }

      const res = await api.post('/v1/voice/procesar-audio', payload);
      if (!isMountedRef.current) return;

      if (res.data.success) {
        const data: ProcessResponse = res.data.data;

        if (data.estado === 'completada') {
          setChatLogs((prev) => [...prev, { role: 'assistant', text: `✅ ${data.asistente_respuesta}` }]);
          reproducirVozAsistente(data.asistente_respuesta, data.tts?.audio_base64);
          toast.success('Comprobante emitido exitosamente.');
          
          const compId = data.intencion?.comprobante_id || (data as any).comprobante_id || (data as any).data?.comprobante_id;
          if (compId) {
            fetchComprobanteEmitido(compId);
            fetchHistorial(1);
          }
          setSession(null);
        } else {
          setSession(data);
          setChatLogs((prev) => [...prev, { role: 'assistant', text: data.asistente_respuesta }]);
          reproducirVozAsistente(data.asistente_respuesta, data.tts?.audio_base64);
        }
      }
    } catch (error: any) {
      if (isMountedRef.current) {
        toast.error('Error al procesar: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setInputText('');
      }
    }
  };

  const confirmarEmision = async () => {
    if (!session || !editableIntencion) return;
    detenerVoz();
    setIsEmitting(true);
    try {
      const res = await api.post('/v1/voice/confirmar-emision', {
        conversacion_id: session.conversacion_id,
        override_data: editableIntencion,
      });

      if (!isMountedRef.current) return;

      if (res.data.success) {
        const msg = res.data.message || 'Comprobante emitido con éxito.';
        setChatLogs((prev) => [...prev, { role: 'assistant', text: `✅ ${msg}` }]);
        reproducirVozAsistente('Operación completada exitosamente. El comprobante ha sido emitido.');
        toast.success(msg);
        
        const compId = res.data.data?.comprobante_id || res.data.data?.data?.comprobante_id;
        if (compId) {
          fetchComprobanteEmitido(compId);
          fetchHistorial(1);
        }
        setSession(null);
      }
    } catch (error: any) {
      if (isMountedRef.current) {
        toast.error('Error en la emisión: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      if (isMountedRef.current) {
        setIsEmitting(false);
      }
    }
  };

  const cancelarEmision = async () => {
    if (!session) return;
    detenerVoz();
    try {
      await api.post('/v1/voice/cancelar', { conversacion_id: session.conversacion_id });
      if (isMountedRef.current) {
        setChatLogs((prev) => [...prev, { role: 'assistant', text: '❌ Emisión cancelada.' }]);
        reproducirVozAsistente('Emisión cancelada.');
        setSession(null);
        toast.info('Operación cancelada.');
      }
    } catch {
      if (isMountedRef.current) {
        setSession(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NubofactHeader />
      <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 p-6 rounded-2xl text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse" />
            <h1 className="text-2xl font-bold">Voice IA — Facturación por Voz</h1>
          </div>
          <p className="text-blue-100 text-sm mt-1">
            Transcripción automática en tiempo real integrada.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isSpeaking && (
            <Button
              variant="secondary"
              size="sm"
              onClick={detenerVoz}
              className="bg-rose-500 hover:bg-rose-600 text-white gap-1 text-xs"
            >
              <VolumeX className="h-4 w-4" /> Detener Voz
            </Button>
          )}
          <Badge variant="secondary" className="px-3 py-1.5 bg-white/20 text-white border-none font-medium">
            Transcripción Directa Activa
          </Badge>
        </div>
      </div>

      {/* Selector de Pestañas */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('asistente')}
          className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-all duration-200 ${
            activeTab === 'asistente'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          Asistente de Voz
        </button>
        <button
          onClick={() => setActiveTab('historial')}
          className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-all duration-200 ${
            activeTab === 'historial'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          Historial de Facturas
        </button>
      </div>

      {activeTab === 'asistente' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chat / Comandos de Voz */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="h-[480px] flex flex-col shadow-sm border-slate-200">
            <CardHeader className="pb-3 border-b bg-slate-50/50 flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Volume2 className={`h-4 w-4 ${isSpeaking ? 'text-emerald-600 animate-bounce' : 'text-primary'}`} /> Diálogo Asistido
              </CardTitle>
              {isSpeaking && (
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 animate-pulse text-xs">
                  🔊 Asistente Hablando...
                </Badge>
              )}
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatLogs.map((log, i) => (
                <div
                  key={i}
                  className={`flex ${log.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-xs ${
                      log.role === 'user'
                        ? 'bg-indigo-600 text-white font-medium space-y-1'
                        : 'bg-slate-100 text-slate-800 border border-slate-200'
                    }`}
                  >
                    <div>{log.text}</div>
                  </div>
                </div>
              ))}

              {isListening && (
                <div className="flex justify-end">
                  <div className="bg-indigo-500/10 text-indigo-700 border border-indigo-200 rounded-2xl px-4 py-2 text-xs flex items-center gap-2 animate-pulse font-medium">
                    <Mic className="h-3.5 w-3.5 text-indigo-600" /> Escuchando tu voz...
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 text-slate-600 rounded-2xl px-4 py-2.5 text-sm flex items-center gap-2 border border-slate-200">
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-600" /> 
                    <span>Procesando solicitud...</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </CardContent>

            <CardFooter className="p-3 border-t bg-slate-50/50 flex gap-2">
              <Input
                placeholder={isListening ? "Escuchando..." : session ? "Escribe 'confirmar' o presiona el micrófono..." : "Factura para Fibertel por 2 routers..."}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && enviarTexto()}
                disabled={isLoading}
                className="bg-white"
              />
              <Button
                variant={isListening ? 'destructive' : 'default'}
                size="icon"
                onClick={toggleListening}
                disabled={isLoading}
                className="shrink-0"
                title={isListening ? 'Detener micrófono' : 'Hablar por micrófono'}
              >
                {isListening ? <MicOff className="h-5 w-5 animate-pulse" /> : <Mic className="h-5 w-5" />}
              </Button>
              <Button
                size="icon"
                onClick={() => enviarTexto()}
                disabled={isLoading || !inputText.trim()}
                className="shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Card de Confirmación Visual */}
        <div className="lg:col-span-6">
          {session && session.intencion ? (
            <Card className="border-2 border-indigo-500 shadow-md bg-white">
              <CardHeader className="bg-indigo-50/80 pb-3 border-b border-indigo-100">
                <div className="flex justify-between items-center">
                  <Badge className="bg-indigo-600 text-white font-semibold">
                    {session.intencion.tipo_comprobante_nombre} ({session.intencion.serie}-{session.intencion.numero})
                  </Badge>
                  <span className="text-xs text-indigo-700 font-medium">
                    Procesado en {session.tiempo_procesamiento_ms} ms
                  </span>
                </div>
                <CardTitle className="text-lg mt-2 text-indigo-950 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-600" /> Confirmar Emisión por Voz
                </CardTitle>
                <CardDescription className="text-indigo-900 text-xs">
                  Revisa los datos reconocidos. Di <b>"confirmar"</b> por micrófono o haz clic abajo.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 space-y-4 text-sm">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente / Empresa</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">RUC / DNI</label>
                      <div className="flex gap-2 mt-0.5">
                        <Input
                          value={editableIntencion ? editableIntencion.cliente_numero_de_documento : ''}
                          onChange={(e) => handleRucChange(e.target.value)}
                          placeholder="RUC o DNI"
                          className="bg-white border-slate-200 h-9"
                        />
                        <Button
                          onClick={() => handleRucSearch(editableIntencion?.cliente_numero_de_documento || '')}
                          size="sm"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 h-9 px-3"
                        >
                          Buscar
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Razón Social</label>
                      <Input
                        value={editableIntencion ? editableIntencion.cliente_denominacion : ''}
                        onChange={(e) => setEditableIntencion(prev => prev ? { ...prev, cliente_denominacion: e.target.value } : null)}
                        placeholder="Razón Social"
                        className="bg-white border-slate-200 mt-0.5"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Detalle de Productos (Editable)</div>
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
                        <tr>
                          <th className="p-3 w-16">Cant</th>
                          <th className="p-3">Descripción / Producto</th>
                          <th className="p-3 w-28 text-right">P. Unit</th>
                          <th className="p-3 w-24 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {editableIntencion && editableIntencion.items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="p-2">
                              <Input
                                type="number"
                                min="1"
                                value={item.cantidad}
                                onChange={(e) => handleItemChange(idx, 'cantidad', e.target.value)}
                                className="w-12 text-center h-8 px-1 py-0 border-slate-200 bg-slate-50/50 font-bold"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                value={item.descripcion}
                                onChange={(e) => handleItemChange(idx, 'descripcion', e.target.value)}
                                className="h-8 px-2 py-0 border-slate-200 bg-slate-50/50"
                              />
                            </td>
                            <td className="p-2 text-right">
                              <div className="relative flex items-center justify-end">
                                <span className="absolute left-2 text-[10px] text-slate-400">S/</span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={item.precio_unitario}
                                  onChange={(e) => handleItemChange(idx, 'precio_unitario', e.target.value)}
                                  className="w-20 text-right h-8 pl-6 pr-2 py-0 border-slate-200 bg-slate-50/50"
                                />
                              </div>
                            </td>
                            <td className="p-3 text-right font-bold text-slate-800">
                              S/ {item.total.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-100/80 space-y-1.5 text-right shadow-2xs">
                  <div className="text-xs text-slate-600">
                    Op. Gravada: <span className="font-semibold text-slate-800">S/ {editableIntencion ? editableIntencion.total_gravada.toFixed(2) : '0.00'}</span>
                  </div>
                  <div className="text-xs text-slate-600">
                    IGV (18%): <span className="font-semibold text-slate-800">S/ {editableIntencion ? editableIntencion.total_igv.toFixed(2) : '0.00'}</span>
                  </div>
                  <div className="text-base font-extrabold text-indigo-900 border-t border-indigo-100/50 pt-1.5 mt-1.5">
                    TOTAL: S/ {editableIntencion ? editableIntencion.total.toFixed(2) : '0.00'}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-4 border-t bg-slate-50 flex justify-between gap-3">
                <Button variant="outline" onClick={cancelarEmision} disabled={isEmitting} className="w-1/2">
                  <XCircle className="h-4 w-4 mr-2 text-rose-500" /> Cancelar
                </Button>
                <Button
                  onClick={confirmarEmision}
                  disabled={isEmitting}
                  className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {isEmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  Confirmar y Emitir
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="h-[480px] flex flex-col items-center justify-center text-center p-6 border-dashed border-2 border-slate-200 bg-slate-50/50">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-4 animate-bounce">
                <Mic className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Esperando Comando por Voz</h3>
              <p className="text-sm text-slate-500 max-w-sm mt-1">
                Haz clic en el micrófono. Lo que hables se escribirá en el campo de texto en tiempo real y podrás enviarlo con un clic o presionar Enter.
              </p>
            </Card>
          )}
        </div>
      </div>
      ) : (
        /* Card de Historial */
        <Card className="shadow-sm border-slate-200 bg-white">
          <CardHeader className="pb-3 border-b bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-600" /> Historial de Comprobantes Emitidos
              </CardTitle>
              <CardDescription className="text-xs">
                Listado y detalles de todas las facturas y boletas electrónicas creadas en el sistema.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => fetchHistorial(currentPage)} disabled={historialLoading}>
              {historialLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Actualizar'}
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {historial.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                {historialLoading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    <span>Cargando comprobantes...</span>
                  </div>
                ) : (
                  <span>No hay comprobantes emitidos.</span>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-100 font-semibold text-slate-700">
                    <tr>
                      <th className="p-4">Comprobante</th>
                      <th className="p-4">Fecha Emisión</th>
                      <th className="p-4">Cliente / RUC</th>
                      <th className="p-4 text-right">Monto Total</th>
                      <th className="p-4 text-center">Estado</th>
                      <th className="p-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {historial.map((comp: any) => (
                      <tr key={comp.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-bold text-slate-900">
                          {comp.tipo_doc === '01' ? 'Factura' : 'Boleta'} {comp.serie}-{comp.correlativo}
                        </td>
                        <td className="p-4 text-slate-600">
                          {comp.fecha_emision}
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-slate-800">{comp.cliente_razon_social}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{comp.cliente_num_doc}</div>
                        </td>
                        <td className="p-4 text-right font-extrabold text-slate-900">
                          S/ {parseFloat(comp.mto_imp_venta).toFixed(2)}
                        </td>
                        <td className="p-4 text-center">
                          <Badge 
                            className={
                              comp.estado_sunat === 'ACEPTADO' 
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100 font-bold' 
                                : 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100 font-bold'
                            }
                          >
                            {comp.estado_sunat || 'PENDIENTE'}
                          </Badge>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => {
                                setShouldAutoPrint(false);
                                fetchComprobanteEmitido(comp.id);
                              }}
                              className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 font-bold h-7 px-2 text-[10px]"
                            >
                              PDF
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
          {totalPages > 1 && (
            <CardFooter className="px-6 py-4 border-t bg-slate-50/50 flex justify-between items-center text-xs">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchHistorial(currentPage - 1)} 
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <span className="font-semibold text-slate-600">
                Página {currentPage} de {totalPages}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchHistorial(currentPage + 1)} 
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button>
            </CardFooter>
          )}
        </Card>
      )}

      {emittedInvoice && (
        <InvoicePrintModal 
          invoice={emittedInvoice} 
          onClose={() => {
            setEmittedInvoice(null);
            setShouldAutoPrint(false);
          }} 
          shouldAutoPrint={shouldAutoPrint}
        />
      )}
      </div>
    </div>
  );
}