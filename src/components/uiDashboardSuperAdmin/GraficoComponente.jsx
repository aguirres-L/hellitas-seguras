export default function GraficoComponente({ titulo, tendencia, dataDistribucion, COLORES_DISTRIBUCION, TrendingUp, ResponsiveContainer, PieChart, Pie, Cell, Tooltip}){
  
  // Función para formatear el tooltip con información detallada
  const formatearTooltip = (value, name, props) => {
    const entrada = dataDistribucion.find(item => item.name === name);
    
    if (!entrada || !entrada.chapitas) {
      return [`${name}: ${value}`, ''];
    }
    
    const chapitas = entrada.chapitas;
    const totalMonto = chapitas.reduce((sum, chapita) => sum + chapita.monto, 0);
    const promedioDias = chapitas.length > 0 ? 
      Math.round(chapitas.reduce((sum, chapita) => sum + chapita.diasDesdePago, 0) / chapitas.length) : 0;
    
    return [
      <div key="tooltip-content" className="p-2">
        <div className="font-semibold text-gray-800 mb-2">{name}: {value}</div>
        <div className="text-xs text-gray-600 space-y-1">
          <div>💰 Total: ${totalMonto.toLocaleString('es-CL')}</div>
     
        </div>
      </div>
    ];
  };

    return(
        <div className="bg-white w-full rounded-xl p-6 shadow-lg">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">{titulo}</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                        <Tooltip
                            formatter={formatearTooltip}
                            labelFormatter={() => ''}
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                        />
                          <Pie
                            data={dataDistribucion}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            label= { (entry) => `${entry.name} ${entry.value}` }
                          >
                            {dataDistribucion.map((entrada, index) => {
                                return (
                                    <Cell key={`cell-${entrada.name}`} fill={COLORES_DISTRIBUCION[index % COLORES_DISTRIBUCION.length]} />
                                )
                            })}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 text-sm text-gray-600 flex items-center gap-2">
                      {tendencia}
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>

    )
}