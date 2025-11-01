import React, { useState } from 'react';

// Este componente no recibe props
const UserSettings = () => {
  const [settings, setSettings] = useState({
    notificaciones: true,
    email: true,
    sms: false,
    tema: 'claro'
  });

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Configuración</h1>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Notificaciones</h2>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notificaciones}
                    onChange={(e) => handleChange('notificaciones', e.target.checked)}
                    className="mr-3"
                  />
                  Notificaciones push
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.email}
                    onChange={(e) => handleChange('email', e.target.checked)}
                    className="mr-3"
                  />
                  Notificaciones por email
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.sms}
                    onChange={(e) => handleChange('sms', e.target.checked)}
                    className="mr-3"
                  />
                  Notificaciones por SMS
                </label>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Tema</h2>
              <select
                value={settings.tema}
                onChange={(e) => handleChange('tema', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="claro">Claro</option>
                <option value="oscuro">Oscuro</option>
                <option value="auto">Automático</option>
              </select>
            </div>
            
            <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings; 