import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { 
  ChevronDown, 
  ShoppingCart, 
  Wrench, 
  ShoppingBag, 
  Package, 
  FileText, 
  FolderOpen, 
  BarChart3,
  CreditCard,
  TrendingUp,
  DollarSign,
  PieChart
} from 'lucide-react';
import logoImage from 'figma:asset/2b8b49f03ee3156bda9aa694847b2fac6af59baa.png';

export default function App() {
  // Data for Total Compras monthly chart
  const monthlyData = [
    { month: 'Ene', value: 4200 },
    { month: 'Feb', value: 3800 },
    { month: 'Mar', value: 5400 },
    { month: 'Abr', value: 5800 },
    { month: 'May', value: 6200 },
    { month: 'Jun', value: 7000 },
    { month: 'Jul', value: 6400 },
    { month: 'Ago', value: 6800 },
    { month: 'Sep', value: 5900 },
    { month: 'Oct', value: 7200 },
    { month: 'Nov', value: 7600 },
    { month: 'Dic', value: 6500 },
  ];

  // CPE data
  const cpeRankingData = [
    { name: 'Machala', value: 9 },
    { name: 'Balanza', value: 9 },
    { name: 'Pesca venta', value: '' },
    { name: 'Pesca Grullas', value: 9 },
    { name: 'Pesca Orillas', value: 9 },
  ];

  // Products with minimum stock
  const minimumStockProducts = [
    {
      id: 1,
      product: 'POLIPROPLENO LIENSTER SHS-PL-DC',
      stock: '0.00',
      state: 'AGOTADO',
      warehouse: 'Oficina Principal',
    },
    {
      id: 2,
      product: 'EXTENSIN SELLA BESLIME SMPSIX-SAMIL',
      stock: '0.00',
      state: 'AGOTADO',
      warehouse: 'Oficina Principal',
    },
    {
      id: 3,
      product: 'AGUIA MOVILIZE EL II USIAMOS',
      stock: '0.00',
      state: 'AGOTADO',
      warehouse: 'Oficina Principal',
    },
    {
      id: 4,
      product: 'LIPISCAL SOLUCIÓN ANTIBISPARATER SODERACIN DIML',
      stock: '0.00',
      state: 'AGOTADO',
      warehouse: 'Oficina Principal',
    },
    {
      id: 5,
      product: 'GEL-JABONY TOPIALOSE II.',
      stock: '0.00',
      state: 'AGOTADO',
      warehouse: 'Oficina Principal',
    },
  ];

  // Monthly sales data for bottom chart
  const monthlySalesData = [
    { month: 'Enero', facturas: 0, boletas: 0, notasVenta: 0, compras: 0 },
    { month: 'Febrero', facturas: 0, boletas: 0, notasVenta: 0, compras: 0 },
    { month: 'Marzo', facturas: 11000, boletas: 11000, notasVenta: 0, compras: 0 },
    { month: 'Abril', facturas: 0, boletas: 0, notasVenta: 0, compras: 0 },
    { month: 'Mayo', facturas: 700, boletas: 105556, notasVenta: 57548, compras: 57306 },
    { month: 'Junio', facturas: 4373, boletas: 93788, notasVenta: 127273, compras: 95692 },
    { month: 'Julio', facturas: 2338, boletas: 95787, notasVenta: 102626, compras: 104596 },
    { month: 'Agosto', facturas: 2092, boletas: 197212, notasVenta: 25648, compras: 95397 },
    { month: 'Septiembre', facturas: 10006, boletas: 193039, notasVenta: 24107, compras: 71079 },
    { month: 'Octubre', facturas: 6137, boletas: 194259, notasVenta: 43107, compras: 69260 },
    { month: 'Noviembre', facturas: 7372, boletas: 176532, notasVenta: 120506, compras: 80537 },
    { month: 'Diciembre', facturas: 3549, boletas: 157618, notasVenta: 118917, compras: 69042 },
  ];

  // Monthly summary table data
  const monthlyTableData = [
    { mes: 'Enero', facturas: 'S/0.00', boletas: 'S/0.00', notasVenta: 'S/7,741.50', compras: 'S/0.00' },
    { mes: 'Febrero', facturas: '0.00', boletas: '0.00', notasVenta: '0.00', compras: '0.00' },
    { mes: 'Marzo', facturas: '0.00', boletas: '0.00', notasVenta: '0.00', compras: '0.00' },
    { mes: 'Abril', facturas: '0.00', boletas: '0.00', notasVenta: '0.00', compras: '0.00' },
    { mes: 'Mayo', facturas: '760.00', boletas: '105,556.44', notasVenta: '57,548.10', compras: '57,306.75' },
    { mes: 'Junio', facturas: '4,373.00', boletas: '93,788.09', notasVenta: '127,273.00', compras: '95,692.25' },
    { mes: 'Julio', facturas: '2,338.44', boletas: '95,787.74', notasVenta: '102,626.00', compras: '104,596.01' },
    { mes: 'Agosto', facturas: '2,092.00', boletas: '197,212.05', notasVenta: '25,648.00', compras: '95,397.34' },
    { mes: 'Septiembre', facturas: '10,006.00', boletas: '193,039.69', notasVenta: '24,107.00', compras: '71,079.68' },
    { mes: 'Octubre', facturas: '6,137.04', boletas: '194,259.74', notasVenta: '43,107.00', compras: '69,260.05' },
    { mes: 'Noviembre', facturas: '7,372.00', boletas: '176,532.00', notasVenta: '120,506.00', compras: '80,537.30' },
    { mes: 'Diciembre', facturas: '3,549.00', boletas: '157,618.00', notasVenta: '118,917.00', compras: '69,042.62' },
    { mes: 'Totales', facturas: '36,289.30', boletas: '1,181,806.06', notasVenta: '707,104.60', compras: '540,914.65', isTotal: true },
  ];

  return (
    <div className="min-h-screen bg-gray-200">
      {/* Header Navigation */}
      <header className="bg-[#234662] text-white">
        <div className="flex items-center justify-between px-4 py-2">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img src={logoImage} alt="Logo" className="h-12 w-12 object-contain bg-white rounded p-1" />
              <img 
                src="https://cdn-icons-png.flaticon.com/512/11726/11726380.png" 
                alt="KPI" 
                className="h-8 w-8 object-contain"
              />
            </div>
            
            {/* Navigation Menu */}
            <nav className="flex items-center gap-1">
              <button className="flex items-center gap-1 px-3 py-2 hover:bg-[#2d5670] rounded text-sm">
                <Wrench size={16} />
                <span>Mantenimiento</span>
                <ChevronDown size={14} />
              </button>
              <button className="flex items-center gap-1 px-3 py-2 hover:bg-[#2d5670] rounded text-sm">
                <ShoppingBag size={16} />
                <span>Compras</span>
                <ChevronDown size={14} />
              </button>
              <button className="flex items-center gap-1 px-3 py-2 hover:bg-[#2d5670] rounded text-sm">
                <Package size={16} />
                <span>Inventario</span>
                <ChevronDown size={14} />
              </button>
              <button className="flex items-center gap-1 px-3 py-2 hover:bg-[#2d5670] rounded text-sm">
                <CreditCard size={16} />
                <span>CPE's</span>
                <ChevronDown size={14} />
              </button>
              <button className="flex items-center gap-1 px-3 py-2 hover:bg-[#2d5670] rounded text-sm">
                <FolderOpen size={16} />
                <span>Archivo De Caja</span>
                <ChevronDown size={14} />
              </button>
              <button className="flex items-center gap-1 px-3 py-2 hover:bg-[#2d5670] rounded text-sm">
                <FileText size={16} />
                <span>Reportes</span>
                <ChevronDown size={14} />
              </button>
            </nav>
          </div>

          {/* Admin Profile */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" 
                alt="Admin" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-right">
              <div className="text-xs text-green-300">Administrador</div>
              <div className="text-xs">PRODUCCION</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[#1a3548] flex">
          <button className="px-6 py-2 bg-[#d9d9d9] text-gray-800 text-sm font-medium">
            Dashboard
          </button>
          <button className="px-6 py-2 text-white hover:bg-[#234662] text-sm">
            Dashboard gra
          </button>
        </div>
      </header>

      {/* Dashboard General Section */}
      <div className="bg-[#cbbfae] py-3">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="bg-[#0c5078] rounded-lg px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div>
                  <h1 className="text-white text-xl font-semibold mb-1">Dashboard General</h1>
                  <p className="text-white text-xs opacity-80">Resumen de operaciones y rendimiento</p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-white text-xs">ESTABLECIMIENTO</label>
                    <input 
                      type="text" 
                      placeholder="OFICINA PRINCIPAL"
                      className="px-3 py-1.5 rounded text-xs bg-white border-none outline-none w-48"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-white text-xs">PERIODO</label>
                    <input 
                      type="text" 
                      placeholder="POR FECHA"
                      className="px-3 py-1.5 rounded text-xs bg-white border-none outline-none w-32"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-white text-xs">FECHA DEL</label>
                    <input 
                      type="text" 
                      placeholder="dd/mm/aaaa"
                      className="px-3 py-1.5 rounded text-xs bg-white border-none outline-none w-32"
                    />
                  </div>
                </div>
              </div>
              
              <div className="text-white text-2xl opacity-40">?</div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="bg-[#cbbfae] pb-4">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {/* CPE Emitidos */}
            <div className="bg-[#0c5078] rounded-lg p-4 flex items-center gap-3">
              <div className="bg-[#164a6b] p-3 rounded">
                <FileText size={24} className="text-white" />
              </div>
              <div>
                <div className="text-white text-xs mb-1">CPE EMITIDOS</div>
                <div className="text-white text-2xl font-semibold">0</div>
              </div>
            </div>

            {/* Total CPE */}
            <div className="bg-[#0c5078] rounded-lg p-4 flex items-center gap-3">
              <div className="bg-[#164a6b] p-3 rounded">
                <BarChart3 size={24} className="text-white" />
              </div>
              <div>
                <div className="text-white text-xs mb-1">TOTAL CPE</div>
                <div className="text-white text-2xl font-semibold">S/ 0.00</div>
              </div>
            </div>

            {/* Total Notas Venta */}
            <div className="bg-[#0c5078] rounded-lg p-4 flex items-center gap-3">
              <div className="bg-[#164a6b] p-3 rounded">
                <ShoppingCart size={24} className="text-white" />
              </div>
              <div>
                <div className="text-white text-xs mb-1">TOTAL NOTAS VENTA</div>
                <div className="text-white text-2xl font-semibold">S/ 0.00</div>
              </div>
            </div>

            {/* Monto Total General */}
            <div className="bg-[#0c5078] rounded-lg p-4 flex items-center gap-3">
              <div className="bg-[#164a6b] p-3 rounded">
                <DollarSign size={24} className="text-white" />
              </div>
              <div>
                <div className="text-white text-xs mb-1">MONTO TOTAL GENERAL</div>
                <div className="text-white text-2xl font-semibold">S/ 0.00</div>
              </div>
            </div>

            {/* Utilidad Neta */}
            <div className="bg-[#0c5078] rounded-lg p-4 flex items-center gap-3">
              <div className="bg-[#164a6b] p-3 rounded">
                <TrendingUp size={24} className="text-white" />
              </div>
              <div>
                <div className="text-white text-xs mb-1">UTILIDAD NETA</div>
                <div className="text-white text-2xl font-semibold">S/ 0.00</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="p-4">
        <div className="max-w-[1400px] mx-auto space-y-4">
          {/* Top Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* CPE Card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-[#0c5078] text-white px-4 py-3">
                <h2 className="text-sm font-semibold">CPE</h2>
              </div>
              <div className="bg-[#b8b8b8] p-4 min-h-[280px]">
                <div className="space-y-2">
                  {cpeRankingData.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-700">{index + 1}</span>
                        <span className="text-gray-800">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-8">
                        <span className="text-gray-700">{item.value}</span>
                        <div className="w-12 h-1 bg-white"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Notas de Venta Card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-[#0c5078] text-white px-4 py-3">
                <h2 className="text-sm font-semibold">Notas de Venta</h2>
              </div>
              <div className="bg-[#b8b8b8] p-4 min-h-[280px]">
                {/* Metrics */}
                <div className="flex justify-around mb-4">
                  <div className="text-center">
                    <div className="text-xs text-gray-700 mb-1">Ingresos</div>
                    <div className="text-blue-400 text-lg font-semibold">234</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-700 mb-1">Egresos</div>
                    <div className="text-red-400 text-lg font-semibold">219.63</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-700 mb-1">M Flujo</div>
                    <div className="text-green-400 text-lg font-semibold">23.32</div>
                  </div>
                </div>

                {/* Filters */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      id="consultar"
                    />
                    <label htmlFor="consultar" className="text-xs text-gray-700">
                      Consultar gráfos:
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      id="filtrar"
                    />
                    <label htmlFor="filtrar" className="text-xs text-gray-700">
                      Filtrar por producto
                    </label>
                  </div>
                </div>

                {/* Vertical Bar Chart */}
                <div className="h-32 flex items-end justify-center gap-1 bg-[#a8a8a8] rounded p-2">
                  <div className="w-6 bg-white h-[20%] rounded-t"></div>
                  <div className="w-6 bg-white h-[30%] rounded-t"></div>
                  <div className="w-6 bg-white h-[50%] rounded-t"></div>
                  <div className="w-6 bg-white h-[70%] rounded-t"></div>
                  <div className="w-6 bg-white h-[40%] rounded-t"></div>
                </div>
              </div>
            </div>

            {/* Total Compras Card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-[#0c5078] text-white px-4 py-3">
                <h2 className="text-sm font-semibold">Total Compras</h2>
              </div>
              <div className="bg-[#b8b8b8] p-4 min-h-[280px]">
                {/* Summary boxes */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-600 mb-1">Total Compras</div>
                    <div className="text-cyan-500 text-lg font-semibold">S/ 7,543,374.65</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-600 mb-1">Saldo</div>
                    <div className="text-lg font-semibold">S/ 7,543,374.65</div>
                  </div>
                </div>

                {/* Monthly Chart */}
                <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height={160} minHeight={160}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#999" />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: '#333', fontSize: 10 }}
                        axisLine={{ stroke: '#666' }}
                      />
                      <YAxis
                        tick={{ fill: '#333', fontSize: 10 }}
                        axisLine={{ stroke: '#666' }}
                      />
                      <Bar dataKey="value" fill="#3b9dd6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Productor Top Card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-[#0c5078] text-white px-4 py-3">
                <h2 className="text-sm font-semibold">Productor Top</h2>
              </div>
              <div className="bg-[#b8b8b8] p-4 min-h-[280px]">
                {/* Dropdown */}
                <div className="mb-3">
                  <select className="w-full bg-white border border-gray-400 rounded px-3 py-2 text-xs">
                    <option>Adicionar X Anónimenes</option>
                  </select>
                </div>

                {/* Table */}
                <div className="bg-white rounded overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-[#0c5078] text-white">
                      <tr>
                        <th className="px-3 py-2 text-left">#</th>
                        <th className="px-3 py-2 text-left">Producto</th>
                        <th className="px-3 py-2 text-left">Mex</th>
                        <th className="px-3 py-2 text-left">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-200">
                        <td className="px-3 py-3" colSpan={4}>&nbsp;</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="px-3 py-3" colSpan={4}>&nbsp;</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="px-3 py-3" colSpan={4}>&nbsp;</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Clientes Top Card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-[#0c5078] text-white px-4 py-3">
                <h2 className="text-sm font-semibold">Clientes Top</h2>
              </div>
              <div className="bg-[#b8b8b8] p-4 min-h-[280px]">
                {/* Dropdown */}
                <div className="mb-3">
                  <select className="w-full bg-white border border-gray-400 rounded px-3 py-2 text-xs">
                    <option>Adicionar anónimemes</option>
                  </select>
                </div>

                {/* Table */}
                <div className="bg-white rounded overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-[#0c5078] text-white">
                      <tr>
                        <th className="px-3 py-2 text-left">#</th>
                        <th className="px-3 py-2 text-left">Cliente</th>
                        <th className="px-3 py-2 text-left">Trans</th>
                        <th className="px-3 py-2 text-left">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-200">
                        <td className="px-3 py-3" colSpan={4}>&nbsp;</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="px-3 py-3" colSpan={4}>&nbsp;</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="px-3 py-3" colSpan={4}>&nbsp;</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Productos con Stock Mínimo Card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-[#0c5078] text-white px-4 py-3">
                <h2 className="text-sm font-semibold">Productos con Stock Mínimo</h2>
              </div>
              <div className="bg-[#b8b8b8] p-4 min-h-[280px]">
                {/* Table */}
                <div className="bg-white rounded overflow-hidden mb-3">
                  <table className="w-full text-xs">
                    <thead className="bg-[#0c5078] text-white">
                      <tr>
                        <th className="px-2 py-2 text-left">#</th>
                        <th className="px-2 py-2 text-left">Producto</th>
                        <th className="px-2 py-2 text-center">Stock</th>
                        <th className="px-2 py-2 text-center">Estado</th>
                        <th className="px-2 py-2 text-center">Almacén</th>
                        <th className="px-2 py-2 text-center">Aposentador</th>
                      </tr>
                    </thead>
                    <tbody>
                      {minimumStockProducts.map((product) => (
                        <tr key={product.id} className="border-b border-gray-200">
                          <td className="px-2 py-2">{product.id}</td>
                          <td className="px-2 py-2 text-[10px]">{product.product}</td>
                          <td className="px-2 py-2 text-center">{product.stock}</td>
                          <td className="px-2 py-2 text-center">
                            <span className="bg-red-600 text-white px-2 py-1 rounded text-[9px] font-semibold">
                              {product.state}
                            </span>
                          </td>
                          <td className="px-2 py-2 text-center text-[10px]">{product.warehouse}</td>
                          <td className="px-2 py-2 text-center">
                            <button className="bg-[#0c5078] text-white p-1 rounded">
                              <ShoppingCart size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Pág. 1/52</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5, 6].map((page) => (
                      <button
                        key={page}
                        className={`w-6 h-6 text-xs rounded ${
                          page === 1
                            ? 'bg-[#0c5078] text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <span className="text-xs text-gray-600 mx-1">**</span>
                    <button className="w-6 h-6 text-xs rounded bg-white text-gray-700 hover:bg-gray-100">
                      52
                    </button>
                    <button className="w-6 h-6 text-xs rounded bg-white text-gray-700 hover:bg-gray-100">
                      &gt;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Chart and Table Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Chart Section */}
            <div className="bg-[#8b9aa3] rounded-lg shadow-md p-4">
              <div className="bg-white rounded p-2 mb-2">
                <div className="flex gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-500"></div>
                    <span>FACTURAS</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-orange-400"></div>
                    <span>BOLETAS</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500"></div>
                    <span>NOTAS DE VENTA</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-400"></div>
                    <span>COMPRAS</span>
                  </div>
                </div>
              </div>
              <div className="h-[400px] w-full bg-[#8b9aa3]">
                <ResponsiveContainer width="100%" height={400} minHeight={400}>
                  <BarChart data={monthlySalesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#666" />
                    <XAxis
                      dataKey="month"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      tick={{ fill: '#333', fontSize: 10 }}
                      interval={0}
                    />
                    <YAxis tick={{ fill: '#333', fontSize: 10 }} />
                    <Bar dataKey="facturas" fill="#ef4444" />
                    <Bar dataKey="boletas" fill="#fb923c" />
                    <Bar dataKey="notasVenta" fill="#22c55e" />
                    <Bar dataKey="compras" fill="#60a5fa" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Table Section */}
            <div className="bg-[#8b9aa3] rounded-lg shadow-md p-4">
              <div className="bg-white rounded overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-[#0c5078] text-white">
                    <tr>
                      <th className="px-3 py-2 text-left">Mes</th>
                      <th className="px-3 py-2 text-right">Facturas</th>
                      <th className="px-3 py-2 text-right">Boletas</th>
                      <th className="px-3 py-2 text-right">Notas de Venta</th>
                      <th className="px-3 py-2 text-right">Compras</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyTableData.map((row, index) => (
                      <tr 
                        key={index} 
                        className={`border-b border-gray-200 ${
                          row.isTotal ? 'bg-gray-200 font-semibold' : ''
                        }`}
                      >
                        <td className="px-3 py-2">{row.mes}</td>
                        <td className="px-3 py-2 text-right">{row.facturas}</td>
                        <td className="px-3 py-2 text-right">{row.boletas}</td>
                        <td className="px-3 py-2 text-right">{row.notasVenta}</td>
                        <td className="px-3 py-2 text-right">{row.compras}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
