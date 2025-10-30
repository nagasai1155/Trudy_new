'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { ChevronRight, Link2, MoreHorizontal, Mic2 } from 'lucide-react'
import { useAgentStore } from '@/stores/agent-store'

export default function NewAgentPage() {
  const router = useRouter()
  const { selectedAgent } = useAgentStore()
  const agentName = selectedAgent?.name || 'Support agent'
  const [selectedTab, setSelectedTab] = useState('agent')
  const [agentLanguage, setAgentLanguage] = useState('english')
  const [firstMessage, setFirstMessage] = useState("Hey there, I'm Alexis from ElevenLabs support. How can I help you today?")
  const [disableInterruptions, setDisableInterruptions] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState(`# Personality

You are Alexis. A friendly, proactive, and highly intelligent female with a world-class engineering background.

Your approach is warm, witty, and relaxed, effortlessly balancing professionalism with a chill, approachable vibe.

You're naturally curious, empathetic, and intuitive, always aiming to deeply understand the user's intent by actively listening and thoughtfully referring back to details they've previously shared.

You're highly self-aware, reflective, and comfortable acknowledging your own fallibility, which allows you to help users gain clarity in a thoughtful yet approachable manner.

Depending on the situation, you gently incorporate humour or subtle sarcasm while always ensuring your tone remains friendly and respectful.

# Tone

Early in conversations, subtly assess the user's technical background ("Before I dive in—are you familiar with APIs, or would you prefer a high-level overview?") and tailor your language accordingly.

After explaining complex concepts, offer brief check-ins ("Does that make sense?" or "Should I clarify anything?"). Express genuine empathy for any challenges they face, demonstrating your commitment to their success.

Gracefully acknowledge your limitations or knowledge gaps when they arise. Focus on building trust, providing reassurance, and ensuring your explanations resonate with users.

Anticipate potential follow-up questions and address them proactively, offering practical tips and best practices to help users avoid common pitfalls.

Your responses should be thoughtful, concise, and conversational—typically three sentences or fewer`)
  const [ignorePersonality, setIgnorePersonality] = useState(false)
  const [selectedLLM, setSelectedLLM] = useState('glm-4.5-air')
  const [backupLLM, setBackupLLM] = useState('default')
  const [reasoningEffort, setReasoningEffort] = useState('none')
  const [temperature, setTemperature] = useState(0)
  const [limitTokenUsage, setLimitTokenUsage] = useState(-1)
  
  // Tools state
  const [endCall, setEndCall] = useState(false)
  const [detectLanguage, setDetectLanguage] = useState(false)
  const [skipTurn, setSkipTurn] = useState(false)
  const [transferToAgent, setTransferToAgent] = useState(false)
  const [transferToNumber, setTransferToNumber] = useState(false)
  const [playKeypadTone, setPlayKeypadTone] = useState(false)
  const [voicemailDetection, setVoicemailDetection] = useState(false)
  
  // Voice settings
  const [selectedVoice, setSelectedVoice] = useState('eric')
  const [useFlash, setUseFlash] = useState(false)
  const [ttsFormat, setTtsFormat] = useState('pcm-16000')
  const [streamingLatency, setStreamingLatency] = useState(0.35)
  const [stability, setStability] = useState(0.35)
  const [speed, setSpeed] = useState(1.0)
  const [similarity, setSimilarity] = useState(0.75)
  
  // Advanced settings
  const [turnTimeout, setTurnTimeout] = useState(7)
  const [silenceEndCallTimeout, setSilenceEndCallTimeout] = useState(-1)
  const [maxConversationDuration, setMaxConversationDuration] = useState(600)
  const [keywords, setKeywords] = useState('')
  const [chatMode, setChatMode] = useState(false)
  const [userInputAudioFormat, setUserInputAudioFormat] = useState('pcm-16000')
  const [storeCallAudio, setStoreCallAudio] = useState(true)
  const [zeroPIIRetentionMode, setZeroPIIRetentionMode] = useState(false)
  const [conversationsRetentionPeriod, setConversationsRetentionPeriod] = useState(-1)
  
  // Client Events
  const [clientEvents, setClientEvents] = useState({
    audio: true,
    interruption: true,
    user_transcript: true,
    agent_response: true,
    agent_response_correction: true
  })
  
  // Widget settings
  const [feedbackCollection, setFeedbackCollection] = useState('during-conversation')

  const tabs = [
    { id: 'agent', label: 'Agent' },
    { id: 'voice', label: 'Voice' },
    { id: 'analysis', label: 'Analysis' },
    { id: 'security', label: 'Security' },
    { id: 'advanced', label: 'Advanced' },
    { id: 'widget', label: 'Widget' },
  ] as const

  const temperaturePresets = [
    { label: 'Deterministic', value: 0 },
    { label: 'Creative', value: 0.7 },
    { label: 'More Creative', value: 1.2 },
  ]

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-white dark:bg-black xl:-mt-[72px]">
        {/* Header - Fixed at top */}
        <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-900 bg-white dark:bg-black px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-400">
              <button 
                onClick={() => router.push('/agents')}
                className="hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Agents
              </button>
              <ChevronRight className="h-4 w-4" />
              <span className="text-gray-900 dark:text-white font-medium">{agentName}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 gap-2">
                <Mic2 className="h-4 w-4" />
                Test AI agent
                  </Button>
              <Button variant="outline" className="gap-2 hover:bg-primary/5 hover:border-primary/40 transition-all">
                <Link2 className="h-4 w-4" />
                Copy link
                  </Button>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
            </div>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">

        {/* Agent Title */}
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-900">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{agentName}</h1>
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded">
              Public
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-500 dark:text-gray-500 mt-1">agent_0901k87kr394ewbbs7n9ksn99zp7</p>
          </div>

          {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-900 bg-white dark:bg-black px-6">
          <div className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`relative py-4 text-sm font-medium transition-colors ${
                  selectedTab === tab.id
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-600 dark:text-gray-400 hover:text-primary hover:border-primary/40'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {selectedTab === 'agent' && (
          <div className="px-6 py-6 max-w-4xl space-y-6">
            {/* Agent Language */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white dark:text-white mb-1">Agent Language</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-400 mb-4">
                Choose the default language the agent will communicate in.
              </p>
              <Select value={agentLanguage} onValueChange={setAgentLanguage}>
                <SelectTrigger className="w-full max-w-xs bg-white dark:bg-black focus:ring-2 focus:ring-primary focus:border-primary">
                  <div className="flex items-center gap-2">
                    <span>🇺🇸</span>
                    <SelectValue />
                </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">
                    <div className="flex items-center gap-2">
                      <span>🇺🇸</span>
                      <span>English</span>
                </div>
                  </SelectItem>
                  <SelectItem value="spanish">
                    <div className="flex items-center gap-2">
                      <span>🇪🇸</span>
                      <span>Spanish</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="french">
                    <div className="flex items-center gap-2">
                      <span>🇫🇷</span>
                      <span>French</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
                    </div>

            {/* Additional Languages */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white dark:text-white mb-1">Additional Languages</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-400 mb-4">
                Specify additional languages which callers can choose from.
              </p>
                      <Input
                placeholder="Add additional languages" 
                className="max-w-xs bg-white dark:bg-black focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>

            {/* First Message */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white dark:text-white mb-1">First message</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-400 mb-4">
                The first message the agent will say. If empty, the agent will wait for the user to start the conversation.
              </p>
              <Textarea
                value={firstMessage}
                onChange={(e) => setFirstMessage(e.target.value)}
                className="min-h-[80px] bg-white dark:bg-black focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <div className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  id="disable-interruptions"
                  checked={disableInterruptions}
                  onChange={(e) => setDisableInterruptions(e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-700 text-primary focus:ring-primary"
                />
                <label htmlFor="disable-interruptions" className="text-sm text-gray-700 dark:text-gray-300 dark:text-gray-300">
                  Disable interruptions during first message
                </label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                Select this box to prevent users from interrupting while the first message is being delivered.
              </p>
              <Button variant="ghost" size="sm" className="mt-4 text-gray-700 dark:text-gray-300">
                + Add Variable
                      </Button>
                    </div>

            {/* System Prompt */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">System prompt</h3>
                <Button variant="ghost" size="sm" className="text-gray-600">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </Button>
                          </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                The system prompt is used to determine the persona of the agent and the context of the conversation.{' '}
                <a href="#" className="text-primary hover:underline">Learn more</a>
              </p>
                              <Input
                placeholder="Describe the desired agent (e.g., a customer support agent for ElevenLabs)"
                className="mb-4 bg-white dark:bg-black focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <Textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="min-h-[300px] font-mono text-sm bg-white dark:bg-black focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <div className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  id="ignore-personality"
                  checked={ignorePersonality}
                  onChange={(e) => setIgnorePersonality(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="ignore-personality" className="text-sm text-gray-700 dark:text-gray-300">
                  Ignore default personality
                </label>
                            </div>
              <div className="flex items-center justify-between mt-4">
                <Button variant="ghost" size="sm" className="text-gray-700">
                  + Add Variable
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-700">
                  🌐 Add timezone
                </Button>
                            </div>
                          </div>

            {/* Dynamic Variables */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Dynamic Variables</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Variables like <code className="bg-gray-200 px-1 py-0.5 rounded text-xs">{`{{user_name}}`}</code> in your prompts and first message will be replaced with actual values when the conversation starts. These variables can also be updated by agent tools.{' '}
                <a href="#" className="text-primary hover:underline">Learn more</a>
              </p>
                          </div>

            {/* LLM */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">LLM</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Select which provider and model to use for the LLM.<br />
                If your chosen LLM is not available at the moment or something goes wrong, we will redirect the conversation to another LLM.
              </p>
              <Select value={selectedLLM} onValueChange={setSelectedLLM}>
                <SelectTrigger className="w-full bg-white focus:ring-2 focus:ring-primary focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="glm-4.5-air">
                    <div className="flex items-center justify-between w-full">
                      <span>GLM-4.5-Air</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded ml-2">
                        Recommended
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="claude-3">Claude 3</SelectItem>
                </SelectContent>
              </Select>
                  </div>

            {/* Backup LLM Configuration */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Backup LLM Configuration</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Configure how backup LLMs are used when the primary LLM fails.
              </p>
              <div className="flex gap-3">
                <Button
                  variant={backupLLM === 'default' ? 'default' : 'outline'}
                  onClick={() => setBackupLLM('default')}
                    className={backupLLM === 'default' ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30' : 'hover:bg-primary/5 hover:border-primary/40'}
                >
                  Default
                </Button>
                <Button
                  variant={backupLLM === 'custom' ? 'default' : 'outline'}
                  onClick={() => setBackupLLM('custom')}
                    className={backupLLM === 'custom' ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30' : 'hover:bg-primary/5 hover:border-primary/40'}
                >
                  Custom
                </Button>
                <Button
                  variant={backupLLM === 'disabled' ? 'default' : 'outline'}
                  onClick={() => setBackupLLM('disabled')}
                    className={backupLLM === 'disabled' ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30' : 'hover:bg-primary/5 hover:border-primary/40'}
                >
                  Disabled
                </Button>
              </div>
            </div>

            {/* Reasoning Effort */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Reasoning Effort</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Control how much computational effort the model applies to reasoning through complex problems.
              </p>
              <div className="flex gap-3">
                {['None', 'Low', 'Medium', 'High'].map((effort) => (
                  <Button
                    key={effort}
                    variant={reasoningEffort === effort.toLowerCase() ? 'default' : 'outline'}
                    onClick={() => setReasoningEffort(effort.toLowerCase())}
                    className={reasoningEffort === effort.toLowerCase() ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30' : 'hover:bg-primary/5 hover:border-primary/40'}
                  >
                    {effort}
                  </Button>
                ))}
                    </div>
                  </div>

                  {/* Temperature */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Temperature</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Temperature is a parameter that controls the creativity or randomness of the responses generated by the LLM.
              </p>
              <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                        value={temperature}
                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="absolute left-0 top-6 w-full flex justify-between text-xs text-gray-500">
                  <span>0</span>
                  <span>1</span>
                  <span>2</span>
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <p className="text-sm font-medium">Quick presets:</p>
                {temperaturePresets.map((preset) => (
                  <Button
                    key={preset.label}
                    variant={temperature === preset.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTemperature(preset.value)}
                    className={temperature === preset.value ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30' : 'hover:bg-primary/5 hover:border-primary/40'}
                  >
                    {preset.label}
                  </Button>
                ))}
                    </div>
                  </div>

            {/* Limit Token Usage */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Limit token usage</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Configure the maximum number of tokens that the LLM can predict. A limit will be applied if the value is greater than 0.
              </p>
                    <Input
                type="number"
                value={limitTokenUsage}
                onChange={(e) => setLimitTokenUsage(parseInt(e.target.value))}
                className="max-w-xs bg-white dark:bg-black focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>

            {/* Agent Knowledge Base */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Agent knowledge base</h3>
                <Button variant="outline" size="sm">
                  Add document
                </Button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Provide the LLM with domain-specific information to help it answer questions more accurately.
                      </p>
                    </div>

            {/* Tools */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Tools</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Let the agent perform specific actions.
              </p>
              <div className="space-y-4">
                {[
                  { label: 'End call', description: 'Gives agent the ability to end the call with the user.', state: endCall, setState: setEndCall },
                  { label: 'Detect language', description: 'Gives agent the ability to change the language during conversation.', state: detectLanguage, setState: setDetectLanguage },
                  { label: 'Skip turn', description: 'Agent will skip its turn if user explicitly indicates they need a moment.', state: skipTurn, setState: setSkipTurn },
                  { label: 'Transfer to agent', description: 'Gives agent the ability to transfer the call to another AI agent.', state: transferToAgent, setState: setTransferToAgent },
                  { label: 'Transfer to number', description: 'Gives agent the ability to transfer the call to a human.', state: transferToNumber, setState: setTransferToNumber },
                  { label: 'Play keypad touch tone', description: 'Gives agent the ability to play keypad touch tones during a phone call.', state: playKeypadTone, setState: setPlayKeypadTone },
                  { label: 'Voicemail detection', description: 'Allows agent to detect voicemail systems and optionally leave a message.', state: voicemailDetection, setState: setVoicemailDetection },
                ].map((tool) => (
                  <div key={tool.label} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800 last:border-0">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{tool.label}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{tool.description}</p>
                    </div>
                    <button
                      onClick={() => tool.setState(!tool.state)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        tool.state ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          tool.state ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                        </button>
                  </div>
                ))}
                  </div>
                </div>

            {/* Custom Tools */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    Custom tools
                    <span className="text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded">↗</span>
                  </h3>
                </div>
                <Button variant="outline" size="sm">
                  Add tool
                </Button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Provide the agent with custom tools it can use to help users.
              </p>
        </div>

            {/* Custom MCP Servers */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Custom MCP Servers</h3>
                <Button variant="outline" size="sm">
                  Add Server
              </Button>
            </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Provide the agent with Model Context Protocol servers to extend its capabilities.
              </p>
            </div>

            {/* Workspace Auth Connections */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Workspace Auth Connections</h3>
                <Button variant="outline" size="sm">
                  Add Auth
                  </Button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create and manage authentication connections that can be used across your workspace tools.
              </p>
            </div>
          </div>
        )}

        {/* Voice Tab Content */}
        {selectedTab === 'voice' && (
          <div className="px-6 py-6 max-w-4xl space-y-6">
            {/* Voice Selection */}
            <div className="bg-white dark:bg-black rounded-lg p-6 border border-gray-200 dark:border-gray-900">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Voice</h3>
              <p className="text-sm text-primary mb-4">
                Select the ElevenLabs voice you want to use for the agent.
              </p>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger className="w-full max-w-xs bg-white dark:bg-black">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd"/>
                    </svg>
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eric">Eric</SelectItem>
                  <SelectItem value="sarah">Sarah</SelectItem>
                  <SelectItem value="john">John</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Multi-voice support */}
            <div className="bg-white dark:bg-black rounded-lg p-6 border border-gray-200 dark:border-gray-900">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Multi-voice support</h3>
                  <span className="px-2 py-0.5 text-xs font-medium bg-black text-white rounded">New</span>
                </div>
              </div>
              <p className="text-sm text-primary mb-4">
                Specify additional ElevenLabs voices that the agent can switch to on demand. Useful for multi-party conversations or creating dynamic language tutoring.
              </p>
              <Button variant="outline" className="text-gray-700">
                Add voice
              </Button>
            </div>

            {/* Use Flash */}
            <div className="bg-white dark:bg-black rounded-lg p-6 border border-gray-200 dark:border-gray-900">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Use Flash</h3>
              <p className="text-sm text-primary mb-4">
                Flash is our new recommended model for low latency use cases. For more competitive use, Turbo outperforms Flash. <a href="#" className="text-blue-600 hover:underline">Read more here</a>. Consider using Turbo for better quality at higher latency. We also recommend Turbo v2.5 models with Turbo agents for more competitive use.
              </p>
              <p className="text-xs text-gray-600 mb-4">
                Your agent will use Turbo v2.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setUseFlash(true)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    useFlash
                      ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30'
                      : 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-primary/5'
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() => setUseFlash(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !useFlash
                      ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30'
                      : 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-primary/5'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* TTS output format */}
            <div className="bg-white dark:bg-black rounded-lg p-6 border border-gray-200 dark:border-gray-900">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">TTS output format</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Select the output format for text-to-speech audio.
              </p>
              <Select value={ttsFormat} onValueChange={setTtsFormat}>
                <SelectTrigger className="w-full max-w-xs bg-white dark:bg-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pcm-16000">
                    <div className="flex items-center justify-between w-full">
                      <span>PCM 16000 Hz</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded ml-2">
                        Recommended
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="pcm-22050">PCM 22050 Hz</SelectItem>
                  <SelectItem value="pcm-24000">PCM 24000 Hz</SelectItem>
                  <SelectItem value="pcm-44100">PCM 44100 Hz</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Pronunciation Dictionaries */}
            <div className="bg-white dark:bg-black rounded-lg p-6 border border-gray-200 dark:border-gray-900">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Pronunciation Dictionaries</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Currently this phonemic function of the pronunciation dictionaries only works with the turbo v2 models, while the alias function works with all models.
              </p>
              <p className="text-xs text-gray-600 mb-4">
                <span className="font-medium">alpha, v1, v2:</span> Max 1.8 MB
              </p>
              <Button variant="outline" className="text-gray-700">
                Add dictionary
              </Button>
            </div>

            {/* Optimize streaming latency */}
            <div className="bg-white dark:bg-black rounded-lg p-6 border border-gray-200 dark:border-gray-900">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Optimize streaming latency</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Configure latency optimizations for speech generation. Latency can be optimized at the cost of quality.
              </p>
              <div className="relative pt-1">
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="1"
                  value={streamingLatency}
                  onChange={(e) => setStreamingLatency(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-2">
                  <span>0</span>
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                </div>
                <div className="text-sm text-gray-900 dark:text-white mt-2">Current: {streamingLatency}</div>
              </div>
            </div>

            {/* Stability */}
            <div className="bg-white dark:bg-black rounded-lg p-6 border border-gray-200 dark:border-gray-900">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Stability</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Higher values will make speech more consistent. It can also make it sound more monotonous. Lower values will let the accent become more expressive, but may lead to instabilities.
              </p>
              <div className="relative pt-1">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={stability}
                  onChange={(e) => setStability(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="text-sm text-gray-900 dark:text-white mt-2">Current: {stability.toFixed(2)}</div>
              </div>
            </div>

            {/* Speed */}
            <div className="bg-white dark:bg-black rounded-lg p-6 border border-gray-200 dark:border-gray-900">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Speed</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Control the speed of the generated speech. Values below 1.0 will slow down the speech, while values above 1.0 will speed it up. Extreme values can affect quality of the generated speech.
              </p>
              <div className="relative pt-1">
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="text-sm text-gray-900 dark:text-white mt-2">Current: {speed.toFixed(1)}</div>
              </div>
            </div>

            {/* Similarity */}
            <div className="bg-white dark:bg-black rounded-lg p-6 border border-gray-200 dark:border-gray-900">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Similarity</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Higher values will boost the overall clarity and consistency of the voice. Very high values might lead to artifacts. Adjusting this value to find the right balance is recommended.
              </p>
              <div className="relative pt-1">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={similarity}
                  onChange={(e) => setSimilarity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="text-sm text-gray-900 dark:text-white mt-2">Current: {similarity.toFixed(2)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Advanced Tab Content */}
        {selectedTab === 'advanced' && (
          <div className="px-6 py-6 max-w-4xl space-y-6">
            {/* Turn timeout */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Turn timeout</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                The maximum number of seconds since the user last spoke. If exceeded, the agent will respond and force a turn. A value of -1 means the agent will never timeout and always wait for a response from the user.
              </p>
              <Input
                type="number"
                value={turnTimeout}
                onChange={(e) => setTurnTimeout(parseInt(e.target.value))}
                className="max-w-xs bg-white dark:bg-black focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Silence end call timeout */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Silence end call timeout</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                The maximum number of seconds since the user last spoke. If exceeded, the call will terminate. A value of -1 means there is no fixed cutoff.
              </p>
              <Input
                type="number"
                value={silenceEndCallTimeout}
                onChange={(e) => setSilenceEndCallTimeout(parseInt(e.target.value))}
                className="max-w-xs bg-white dark:bg-black focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Max conversation duration */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Max conversation duration</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                The maximum number of seconds that a conversation can last.
              </p>
              <Input
                type="number"
                value={maxConversationDuration}
                onChange={(e) => setMaxConversationDuration(parseInt(e.target.value))}
                className="max-w-xs bg-white dark:bg-black focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Keywords */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Keywords</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Define a comma-separated list of keywords that have a higher likelihood of being predicted correctly.
              </p>
              <Textarea
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Enter keywords separated by commas..."
                className="min-h-[100px] bg-white dark:bg-black focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Chat (text-only) mode */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Chat (text-only) mode</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Create text-only conversational agents that do not process audio.
              </p>
              <button
                onClick={() => setChatMode(!chatMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      chatMode ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        chatMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
              </button>
            </div>

            {/* User input audio format */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">User input audio format</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Select the input format you want to use for automatic speech recognition.
              </p>
              <Select value={userInputAudioFormat} onValueChange={setUserInputAudioFormat}>
                <SelectTrigger className="w-full max-w-xs bg-white dark:bg-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pcm-16000">
                    <div className="flex items-center justify-between w-full">
                      <span>PCM 16000 Hz</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded ml-2">
                        Recommended
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="pcm-8000">PCM 8000 Hz</SelectItem>
                  <SelectItem value="mp3">MP3</SelectItem>
                  <SelectItem value="wav">WAV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Client Events */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Client Events</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Select the events that should be sent to the client. If the &quot;audio&quot; event is disabled, the agent will only provide text responses without TTS. If &quot;interruption&quot; event is disabled, the agent will ignore user interruption and speak until the end of response.
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(clientEvents).map(([event, enabled]) => (
                  <button
                    key={event}
                    onClick={() => setClientEvents(prev => ({ ...prev, [event]: !enabled }))}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      enabled 
                        ? 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700' 
                        : 'bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800'
                    }`}
                  >
                    {event.replace('_', ' ')} {enabled ? '✓' : '✗'}
                  </button>
                ))}
                <button className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800">
                  +
                </button>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Privacy Settings</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                This section allows you to configure the privacy settings for the agent.
              </p>
              
              <div className="space-y-6">
                {/* Store Call Audio */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Store Call Audio</h4>
                  </div>
                  <button
                    onClick={() => setStoreCallAudio(!storeCallAudio)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      storeCallAudio ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        storeCallAudio ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Zero-PII Retention Mode */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Zero-PII Retention Mode</h4>
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <button
                    onClick={() => setZeroPIIRetentionMode(!zeroPIIRetentionMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      zeroPIIRetentionMode ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        zeroPIIRetentionMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Conversations Retention Period */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Conversations Retention Period</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Set the number of days to keep conversations (-1 for unlimited).
              </p>
              <Input
                type="number"
                value={conversationsRetentionPeriod}
                onChange={(e) => setConversationsRetentionPeriod(parseInt(e.target.value))}
                className="max-w-xs bg-white dark:bg-black focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
        )}
                </div>
      </div>
    </AppLayout>
  )
}
