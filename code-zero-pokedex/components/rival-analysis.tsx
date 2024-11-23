'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts'
import { motion } from 'framer-motion'

const typeData = [
  { name: 'Fire', count: 3 },
  { name: 'Water', count: 2 },
  { name: 'Grass', count: 1 },
  { name: 'Electric', count: 2 },
  { name: 'Psychic', count: 1 },
  { name: 'Normal', count: 1 },
]

const statData = [
  { name: 'HP', value: 320 },
  { name: 'Attack', value: 280 },
  { name: 'Defense', value: 300 },
  { name: 'Sp. Atk', value: 350 },
  { name: 'Sp. Def', value: 290 },
  { name: 'Speed', value: 310 },
]

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FED766', '#2AB7CA', '#F0B67F']

export default function RivalAnalysis() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4 text-blue-600">Rival Analysis</h2>
      <Tabs defaultValue="type" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="type" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Type Distribution</TabsTrigger>
          <TabsTrigger value="stats" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Team Stats</TabsTrigger>
        </TabsList>
        <TabsContent value="type">
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">Type Distribution</CardTitle>
              <CardDescription>Breakdown of Pokémon types in the rival's team</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <ChartContainer config={{
                count: {
                  label: "Count",
                  color: "hsl(var(--chart-1))",
                },
              }} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {typeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">Team Stats</CardTitle>
              <CardDescription>Overall statistics of the rival's team</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <ChartContainer config={{
                value: {
                  label: "Value",
                  color: "hsl(var(--chart-2))",
                },
              }} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="value" fill="#4ECDC4" name="Value">
                      {statData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

