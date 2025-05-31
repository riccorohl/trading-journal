
import React, { useState } from 'react';
import { Search, Filter, FolderPlus, FileText, Calendar, ChevronDown, Plus } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  date: string;
  content: string;
  netPnL: number;
}

const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Mon, May 05, 2025',
    date: '05/06/2025',
    content: 'Things I learned.\n\n• The direction of the volume after ISM Services PMI. It has a fairly high volume and if there isn\'t any bias, on the previous 4hr candle I don\'t know how to react.',
    netPnL: 0
  },
  {
    id: '2', 
    title: 'Fri, Apr 04, 2025',
    date: '05/04/2025',
    content: '',
    netPnL: 0
  },
  {
    id: '3',
    title: 'Fri, Aug 09, 2024', 
    date: '08/09/2024',
    content: '',
    netPnL: 0
  }
];

const Notebook: React.FC = () => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(mockNotes[0]);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">Notebook</h1>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search notes"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <button className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded">
              <FolderPlus className="w-4 h-4" />
              <span>Add folder</span>
            </button>
            <div className="flex items-center space-x-2">
              <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded">
                <Filter className="w-4 h-4" />
              </button>
              <button className="flex items-center space-x-1 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded">
                <FileText className="w-4 h-4" />
                <span>Log day</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Folders */}
        <div className="p-4 border-b border-gray-200">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
              <ChevronDown className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Folders</span>
            </div>
            <div className="ml-6 space-y-1">
              <div className="text-sm text-purple-600 cursor-pointer hover:underline">All notes</div>
              <div className="text-sm text-gray-600 cursor-pointer hover:text-gray-900">Trade Notes</div>
              <div className="text-sm text-gray-600 cursor-pointer hover:text-gray-900">Daily Journal</div>
              <div className="text-sm text-gray-600 cursor-pointer hover:text-gray-900">Sessions Recap</div>
              <div className="text-sm text-gray-600 cursor-pointer hover:text-gray-900">My notes</div>
            </div>
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto">
          {mockNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => setSelectedNote(note)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedNote?.id === note.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium text-gray-900 text-sm">{note.title}</h3>
                <span className="text-xs text-gray-500">{note.date}</span>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2">
                {note.content || 'No content'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedNote ? (
          <>
            {/* Note Header */}
            <div className="bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <h2 className="text-xl font-semibold text-gray-900">{selectedNote.title}</h2>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>
              
              <div className="text-sm text-gray-500 mb-4">
                Net P&L ${selectedNote.netPnL.toFixed(2)}
              </div>
              
              <div className="text-xs text-gray-400">
                Created: {selectedNote.date} 08:00AM Last updated: {selectedNote.date} 07:38PM
              </div>
            </div>

            {/* Note Content */}
            <div className="flex-1 p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">0</div>
                  <div className="text-sm text-gray-500">Total trades</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">0</div>
                  <div className="text-sm text-gray-500">Winners</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">$0.00</div>
                  <div className="text-sm text-gray-500">Gross P&L</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">$0.00</div>
                  <div className="text-sm text-gray-500">Commissions</div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-sm text-gray-500">Recently used templates</span>
                  <button className="text-sm text-blue-600 hover:underline">Pre-Market Checklist</button>
                  <button className="text-sm text-blue-600 hover:underline">EOD Notes</button>
                  <button className="text-sm text-blue-600 hover:underline">Trade Checklist</button>
                  <button className="flex items-center space-x-1 text-sm text-blue-600 hover:underline">
                    <Plus className="w-3 h-3" />
                    <span>Add template</span>
                  </button>
                </div>
              </div>

              {/* Rich Text Editor Placeholder */}
              <div className="border border-gray-300 rounded-lg">
                <div className="border-b border-gray-200 p-3 flex items-center space-x-4 text-sm">
                  <button className="font-bold">B</button>
                  <button className="italic">I</button>
                  <button className="underline">U</button>
                  <span>|</span>
                  <button>Font</button>
                  <button>16</button>
                </div>
                <div className="p-4 min-h-48">
                  <div className="whitespace-pre-wrap text-gray-900">
                    {selectedNote.content || 'Start writing your notes here...'}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Select a note to view its content</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notebook;
