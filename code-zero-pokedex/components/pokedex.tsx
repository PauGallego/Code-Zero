'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QrCode, Mic, Search, Users, BarChart2, Bot, List, Grid } from 'lucide-react'
import PokemonList from '@/components/pokemon-list'
import QRScanner from '@/components/qr-scanner'
import TeamManagement from '@/components/team-management'
import RivalAnalysis from '@/components/rival-analysis'
import AIAssistant from '@/components/ai-assistant'
import { motion, AnimatePresence } from 'framer-motion'

export default function Pokedex() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('list')

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleVoiceSearch = () => {
    // Implement voice search logic here
  }

  const handleQRScan = () => {
    setIsScanning(true)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-red-500 to-yellow-400 shadow-xl rounded-xl overflow-hidden">
      <CardContent className="p-6">
        <motion.h1 
          className="text-4xl font-bold mb-6 text-center text-white drop-shadow-lg"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Pokédex 2.0
        </motion.h1>
        <div className="flex items-center mb-6 gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search Pokémon..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-10 border-2 border-yellow-300 focus:border-yellow-500 rounded-full bg-white/90"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400" size={20} />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2"
              onClick={handleVoiceSearch}
            >
              <Mic className="text-red-400" size={20} />
            </Button>
          </div>
          <Button variant="outline" size="icon" onClick={handleQRScan} className="rounded-full border-2 border-yellow-300 hover:bg-yellow-100 bg-white/90">
            <QrCode size={24} className="text-red-500" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setIsAIAssistantOpen(true)} className="rounded-full border-2 border-yellow-300 hover:bg-yellow-100 bg-white/90">
            <Bot size={24} className="text-red-500" />
          </Button>
        </div>
        <Tabs defaultValue="list" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-4 bg-white/90 rounded-full p-1">
            <TabsTrigger value="list" className="rounded-full data-[state=active]:bg-red-500 data-[state=active]:text-white">
              <List size={16} className="mr-2" />
              List
            </TabsTrigger>
            <TabsTrigger value="grid" className="rounded-full data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <Grid size={16} className="mr-2" />
              Grid
            </TabsTrigger>
            <TabsTrigger value="team" className="rounded-full data-[state=active]:bg-green-500 data-[state=active]:text-white">
              <Users size={16} className="mr-2" />
              Team
            </TabsTrigger>
            <TabsTrigger value="rival" className="rounded-full data-[state=active]:bg-yellow-500 data-[state=active]:text-white">
              <BarChart2 size={16} className="mr-2" />
              Rival
            </TabsTrigger>
          </TabsList>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="list">
                <PokemonList view="list" searchQuery={searchQuery} />
              </TabsContent>
              <TabsContent value="grid">
                <PokemonList view="grid" searchQuery={searchQuery} />
              </TabsContent>
              <TabsContent value="team">
                <TeamManagement />
              </TabsContent>
              <TabsContent value="rival">
                <RivalAnalysis />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </CardContent>
      {isScanning && <QRScanner onClose={() => setIsScanning(false)} />}
      <AIAssistant isOpen={isAIAssistantOpen} onClose={() => setIsAIAssistantOpen(false)} />
    </Card>
  )
}

