import React from 'react';

export default function PokedexView() {
    return (
        <div className="bg-[#F23030] w-[400px] h-[80vh] rounded-xl p-3 pt-0 shadow-xl border-4 border-black mx-auto flex flex-col items-center overflow-hidden">

            {/* Screen */}
            <div className='flex flex-row justify-between items-center border-black rounded-lg h-[12%] w-[90%] mb-0'>
                <div>
                    <button className="w-10 h-10 bg-blue-400 rounded-full"
                        style={{
                            backgroundImage: "url('musica.png')",
                            backgroundSize: '80%',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            padding: '5px',
                            border: '2px solid black'
                        }}
                    >
                    </button>
                </div>
                <div className='text-3xl'>
                    <span>Pokedex de skibidi</span>
                </div>
                <div>
                    <button className="w-10 h-10 bg-blue-400 rounded-full"
                        style={{
                            backgroundImage: "url('pokeball.png')",
                            backgroundSize: '100%',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                        }}
                    >
                    </button>
                </div>
            </div>
            <div className="bg-white border-4 border-black rounded-lg h-[60%] w-[90%] flex justify-center items-center text-gray-400 mb-4">
                <p>Insert Image or Information Here</p>
            </div>

            {/* Controls */}
            <div className="bg-[#636363] border-4 border-black rounded-lg p-2 w-[90%] h-[35%] flex flex-col justify-between">
                {/* Info */}
                <div className="flex justify-between items-center  border-2 border-black bg-[#8CBF3F] rounded-xl px-2 text-black text-2xl h-auto">
                    <span className="flex items-center justify-center">Charizart</span>
                    <span className="flex items-center justify-center">Type</span>
                </div>

                {/* Buttons */}
                <div className="flex justify-between mt-1 h-full">
                    {/* Dpad */}
                    <div className="flex-grow relative overflow-hidden w-[20%]">
                        <div
                            style={{
                                backgroundImage: "url('dpad.png')", // Reemplaza con la URL de tu imagen
                                backgroundSize: 'contain',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                                width: '100%',
                                height: '100%',
                                margin: '0px'
                            }}
                        ></div>
                    </div>
                    {/* Button Group */}
                    <div className='flex bg-[#8DC643] w-[60%] rounded-sm border border-black'>
                        
                    </div>
                    <div className="flex flex-col justify-between  h-full p-2 relative w-[20%]">
                        <button
                            className="w-full h-[50%] bg-red-600 text-white font-bold rounded-full shadow-lg"
                            style={{
                                alignSelf: 'flex-start',
                            }}
                        >
                            X
                        </button>
                        <button
                            className="w-full h-[50%] bg-green-600 text-white font-bold rounded-full shadow-lg"
                            style={{
                                alignSelf: 'flex-end',
                            }}
                        >
                            ✔
                        </button>
                    </div>


                </div>
            </div>
        </div>
    );
}
