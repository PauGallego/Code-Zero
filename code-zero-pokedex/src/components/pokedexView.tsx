import React from 'react'

export default function PokedexView() {
    return (
        <div className="bg-red-600 w-[400px] rounded-xl p-4 shadow-xl border-4 border-black mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div className="w-10 h-10 bg-cyan-400 border-4 border-black rounded-full"></div>
                <h1 className="text-lg text-black font-bold text-center flex-grow">
                    Pokédex of Anomalies
                </h1>
                <div className="relative w-8 h-8 bg-white border-4 border-black rounded-full">
                    <div className="absolute w-3 h-3 bg-black rounded-full border-2 border-white top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                </div>
            </div>

            {/* Screen */}
            <div className="bg-white border-4 border-black rounded-lg h-40 flex justify-center items-center text-gray-400 mb-4">
                <p>Insert Image or Information Here</p>
            </div>

            {/* Controls */}
            <div className="bg-green-400 border-4 border-black rounded-lg p-4">
                {/* Info */}
                <div className="space-y-2">
                    <div className="flex flex-col">
                        <label htmlFor="pokemonName" className="font-bold text-sm">
                            Pokémon Name:
                        </label>
                        <input
                            id="pokemonName"
                            type="text"
                            placeholder="Enter Pokémon Name"
                            className="p-2 border-2 border-black rounded-md"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="pokemonType" className="font-bold text-sm">
                            Type(s):
                        </label>
                        <input
                            id="pokemonType"
                            type="text"
                            placeholder="Enter Type(s)"
                            className="p-2 border-2 border-black rounded-md"
                        />
                    </div>
                </div>

                {/* Description */}
                <textarea
                    id="description"
                    placeholder="Put a description in here!"
                    className="mt-4 p-2 border-2 border-black rounded-md w-full resize-none h-20"
                ></textarea>

                {/* Buttons */}
                <div className="flex justify-between mt-4">
                    <button className="w-10 h-10 bg-red-600 text-white font-bold rounded-full shadow-lg">
                        X
                    </button>
                    <button className="w-10 h-10 bg-green-600 text-white font-bold rounded-full shadow-lg">
                        ✔
                    </button>
                </div>
            </div>
        </div>

    )
}
