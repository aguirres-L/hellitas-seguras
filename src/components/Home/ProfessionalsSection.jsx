import React from "react";
import UseFrameMotion from "../hook_ui_components/UseFrameMotion";

// Este componente no recibe props
export default function ProfessionalsSection() {
    return (
        <section aria-label="Sección para profesionales" className="relative mt-20 mb-16">
            {/* Separador decorativo superior */}
          <UseFrameMotion tipoAnimacion="scale" duracion={1} delay={0.5} waitForUserView={true}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-pink-500 to-orange-500" />
            </UseFrameMotion>
            {/* Fondo contrastante para separar visualmente la sección */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-50 via-blue-50/30 to-white" />
            
            {/* Elementos decorativos de fondo */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-orange-100 rounded-full opacity-20 -z-10" />
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-100 rounded-full opacity-20 -z-10" />

            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full mb-6">
                        <span className="text-2xl">🤝</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                        ¿Eres dueño de una veterinaria, peluquería o tienda de mascotas?
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Súmate a la comunidad y aporta a la identificación y rescate de mascotas perdidas.
                    </p>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    <UseFrameMotion tipoAnimacion="slideRight" duracion={1} delay={0.5} waitForUserView={true}>
                    {/* Veterinarios */}
                    <article className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-blue-100">
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                                <span role="img" aria-label="veterinarios" className="text-2xl">🏥</span>
                            </div>
                        </div>
                        <div className="pt-8">
                            <h3 className="text-xl font-bold text-gray-800 text-center mb-3">Veterinarios</h3>
                            <p className="text-gray-600 text-center mb-6 leading-relaxed">
                                Ofrece servicios médicos y ayuda a mascotas perdidas en tu clínica.
                            </p>
                            <a
                                href="/register-profesional"
                                className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl text-sm font-semibold text-center hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                            >
                                Registrarse
                            </a>
                        </div>
                    </article>
                    </UseFrameMotion>

                    <UseFrameMotion tipoAnimacion="slideDown" duracion={1} delay={0.5} waitForUserView={true}>
                    {/* Peluqueros */}
                    <article className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-purple-100">
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                <span role="img" aria-label="peluqueros" className="text-2xl">✂️</span>
                            </div>
                        </div>
                        <div className="pt-8">
                            <h3 className="text-xl font-bold text-gray-800 text-center mb-3">Peluqueros</h3>
                            <p className="text-gray-600 text-center mb-6 leading-relaxed">
                                Cuida y embellece a las mascotas de la comunidad con tus servicios.
                            </p>
                            <a
                                href="/register-profesional"
                                className="block w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl text-sm font-semibold text-center hover:from-purple-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                            >
                                Registrarse
                            </a>
                        </div>
                    </article>
                    </UseFrameMotion>

                    <UseFrameMotion tipoAnimacion="slideLeft" duracion={1} delay={0.5} waitForUserView={true}>
                    {/* Tiendas */}
                    <article className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-green-100">
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                                <span role="img" aria-label="tiendas" className="text-2xl">🛍️</span>
                            </div>
                        </div>
                        <div className="pt-8">
                            <h3 className="text-xl font-bold text-gray-800 text-center mb-3">Tiendas de Mascotas</h3>
                            <p className="text-gray-600 text-center mb-6 leading-relaxed">
                                Vendes alimentos y productos para mascotas en tu tienda.
                            </p>
                            <a
                                href="/register-profesional"
                                className="block w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl text-sm font-semibold text-center hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                            >
                                Registrarse
                            </a>
                        </div>
                    </article>
                    </UseFrameMotion>


                </div>

                {/* Acceso existente */}
                <UseFrameMotion tipoAnimacion="slideUp" duracion={1} delay={1} waitForUserView={true}>
                <div className="text-center mt-16">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100 max-w-md mx-auto">
                        <p className="text-gray-600 mb-4 text-lg">¿Ya tienes cuenta?</p>
                        <a
                            href="/login-profesional"
                            className="inline-flex items-center bg-gradient-to-r from-orange-500 to-pink-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
                        >
                            <span>Acceder a mi panel de servicios</span>
                            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </a>
                    </div>
                </div>
                </UseFrameMotion>

            </div>
        </section>
    );
}


