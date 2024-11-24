import React from 'react';
import { Button } from '../ui/button';

export default function PokedexView({
    pokemonId = "No ID",
    pokemonCount = 0,
    pokemonName = "Unknown Pokemon",
    pokemonType = "Unknown Type",
    pokemonDesc = "Descripción no disponible.",
    pokemonEvolutions = "Sin información de evolución.",
    pokemonWeight = "Unknown weight",
    pokemonHeight = "Unknown height",
    pokemonHabitat = "Unknown habitat",
    pokemonImage = "https://via.placeholder.com/150",
    datoCurioso = "Dato curioso no disponible",
}) {
    return (
        <div className="bg-[#F23030] w-[400px] h-auto gap-2 rounded-xl p-2 shadow-xl border-4 border-black mx-auto flex flex-col items-center overflow-hidden">

            <div className='flex flex-col bg-blue-100 border-black border-4 rounded-lg h-full w-full p-2'>

                <div className='flex flex-row gap-2 h-[200px] p-3'>

                    <div className="bg-white border-1 border-black rounded-lg h-full w-[50%] flex items-center justify-center">
                        <img
                            src={pokemonImage}
                            alt={pokemonName}
                            className="h-full w-full object-contain rounded-lg"
                        />
                    </div>

                    <div className='text-black text-xl h-[20%] w-[100%]'>
                        <p>Id: {pokemonId}</p>
                        <p>Count: {pokemonCount}</p>
                        <Button
                            variant="outline"
                            className="rounded-lg border-2 border-green-500 hover:bg-green-100 bg-white/90 text-green-500 w-[100%] h-[80%]"
                        >
                            Evolve All
                        </Button>
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-[#636363] border-4  border-black rounded-lg p-1 w-full h-[35%] flex flex-col justify-between">
                    {/* Info */}
                    <div className="flex justify-between items-center border-2 border-black bg-[#dadada] rounded-xl px-2 text-black text-2xl h-auto">
                        <span className="flex items-center justify-center max-w-[50%]">{pokemonName}</span>
                        <span className="flex items-center justify-center max-w-[50%]">{pokemonType}</span>
                    </div>

                    <div className="flex flex-col gap-3 my-2  items-center border-2 border-black bg-[#e4e4e4] rounded-xl px-2 text-black text-xl h-auto">
                        <div className='flex justify-between items w-full'>
                            <span className="flex items-start justify-center max-w-[50%]"><strong></strong> {pokemonDesc}</span>
                            <span className="flex items-start justify-center max-w-[50%]">Evoluciones: {pokemonEvolutions}</span>
                        </div>
                        <div className='flex justify-between items w-full'>
                            <span className="flex items-start justify-center max-w-[50%]">Peso: {pokemonWeight}</span>
                            <span className="flex items-start justify-center max-w-[50%]">Altura: {pokemonHeight}</span>
                        </div>
                        <div className='flex justify-between items w-full'>
                            <span className="flex items-start justify-center max-w-[50%]">Habitat: {pokemonHabitat}</span>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-between mt-1 h-full">
                        <div className='flex bg-[#ececec] w-full rounded-sm border border-black'>
                            
                        </div>
                        <div className="flex flex-col justify-between h-full p-2  ">
                            <Button
                                variant="default"
                                className="w-10 h-10 rounded-full bg-[#fe6161] border border-black shadow-lg hover:scale-105 hover:bg-[#dedede] transition-transform"
                                style={{
                                    backgroundImage: `url('/go-back.png')`, 
                                    backgroundSize: 'cover', 
                                    backgroundPosition: 'center', 
                                    backgroundRepeat: 'no-repeat', 
                                }}
                            >
                                
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
