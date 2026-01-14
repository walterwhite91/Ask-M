import { useState } from 'react';
import { Search, Upload, MoreVertical, FileText, ImageIcon, Download, Edit, Trash2, CheckCircle, Clock, X } from 'lucide-react';
import { NotesOCRReview } from './NotesOCRReview';

interface NoteFile {
  id: number;
  title: string;
  date: string;
  fileType: 'PDF' | 'IMG' | 'TXT';
  semester: string;
  subject: string;
  syllabusTopics: string[];
  status: 'indexed' | 'pending';
}

export function ApprovedNotesRepository() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState<number | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    subjectCode: '',
    subjectName: '',
    syllabusTopics: '',
    file: null as File | null
  });

  const notes: NoteFile[] = [
    {
      id: 1,
      title: 'Unit 3 - Graph Theory Notes',
      date: 'Oct 24, 2023',
      fileType: 'PDF',
      semester: 'II/I',
      subject: 'Discrete Mathematics',
      syllabusTopics: ['Graph Theory', 'Spanning Trees', 'Shortest Path'],
      status: 'indexed'
    },
    {
      id: 2,
      title: 'Binary Search Trees - Lecture 5',
      date: 'Nov 12, 2023',
      fileType: 'IMG',
      semester: 'II/I',
      subject: 'Data Structures',
      syllabusTopics: ['Binary Trees', 'Tree Traversal', 'BST Operations'],
      status: 'indexed'
    },
    {
      id: 3,
      title: 'Theory of Computation Summary',
      date: 'Dec 01, 2023',
      fileType: 'PDF',
      semester: 'III/II',
      subject: 'TOC',
      syllabusTopics: ['Automata Theory', 'Turing Machines', 'Computability'],
      status: 'indexed'
    },
    {
      id: 4,
      title: 'Neural Networks Basics',
      date: 'Jan 08, 2024',
      fileType: 'PDF',
      semester: 'IV/I',
      subject: 'AI',
      syllabusTopics: ['Neural Networks', 'Backpropagation', 'Deep Learning'],
      status: 'pending'
    },
    {
      id: 5,
      title: 'Logic Gates & Boolean Algebra',
      date: 'Sep 15, 2023',
      fileType: 'IMG',
      semester: 'I/II',
      subject: 'Logic',
      syllabusTopics: ['Boolean Algebra', 'Logic Gates', 'Truth Tables'],
      status: 'indexed'
    },
    {
      id: 6,
      title: 'Algorithms Cheat Sheet',
      date: 'Oct 30, 2023',
      fileType: 'TXT',
      semester: 'III/I',
      subject: 'Algorithms',
      syllabusTopics: ['Sorting', 'Dynamic Programming', 'Greedy Algorithms'],
      status: 'indexed'
    }
  ];

  const getFileTypeIcon = (type: NoteFile['fileType']) => {
    switch (type) {
      case 'PDF':
        return <FileText className="w-4 h-4 text-red-400" />;
      case 'IMG':
        return <ImageIcon className="w-4 h-4 text-blue-400" />;
      case 'TXT':
        return <FileText className="w-4 h-4 text-green-400" />;
    }
  };

  const getStatusBadge = (status: NoteFile['status']) => {
    if (status === 'indexed') {
      return (
        <CheckCircle className="w-5 h-5 text-green-400" />
      );
    }
    return (
      <Clock className="w-5 h-5 text-yellow-400" />
    );
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle upload logic here
    console.log('Upload form:', uploadForm);
    setShowUploadModal(false);
    setUploadForm({
      subjectCode: '',
      subjectName: '',
      syllabusTopics: '',
      file: null
    });
  };

  return (
    <>
      <div className="flex-1 overflow-auto bg-[#121212] p-4 lg:p-8 pt-16 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl mb-2">Approved Notes Repository</h1>
            <p className="text-[#A0A0A0] text-sm lg:text-base">Manage student notes approved for OCR processing</p>
          </div>

          {/* Controls */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-[#3D3E40] hover:bg-[#4D4E50] rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Note</span>
            </button>
            
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A0A0]" />
              <input
                type="text"
                placeholder="Search by code or contributor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#2D2E30] border border-[#3D3E40] rounded-lg pl-10 pr-4 py-2 text-white placeholder-[#A0A0A0] focus:outline-none focus:border-[#4D4E50] text-sm lg:text-base"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-[#2D2E30] rounded-xl border border-[#3D3E40] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#3D3E40]">
                    <th className="text-left px-4 lg:px-6 py-4 text-[#A0A0A0] text-sm">Title</th>
                    <th className="text-left px-4 lg:px-6 py-4 text-[#A0A0A0] text-sm">Subject</th>
                    <th className="text-left px-4 lg:px-6 py-4 text-[#A0A0A0] text-sm">Year/Sem</th>
                    <th className="text-left px-4 lg:px-6 py-4 text-[#A0A0A0] text-sm">File Type</th>
                    <th className="text-left px-4 lg:px-6 py-4 text-[#A0A0A0] text-sm">Date Added</th>
                    <th className="text-left px-4 lg:px-6 py-4 text-[#A0A0A0] text-sm">Status</th>
                    <th className="text-right px-4 lg:px-6 py-4 text-[#A0A0A0] text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {notes.map((note) => (
                    <tr
                      key={note.id}
                      className="border-b border-[#3D3E40] hover:bg-[#3D3E40]/30 transition-colors"
                    >
                      <td className="px-4 lg:px-6 py-4 text-white text-sm">{note.title}</td>
                      <td className="px-4 lg:px-6 py-4 text-white text-sm">{note.subject}</td>
                      <td className="px-4 lg:px-6 py-4 text-[#A0A0A0] text-sm">{note.semester}</td>
                      <td className="px-4 lg:px-6 py-4">
                        <span className="inline-flex items-center gap-2 text-white text-sm">
                          {getFileTypeIcon(note.fileType)}
                          {note.fileType}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-[#A0A0A0] text-sm whitespace-nowrap">{note.date}</td>
                      <td className="px-4 lg:px-6 py-4">{getStatusBadge(note.status)}</td>
                      <td className="px-4 lg:px-6 py-4 text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={() => setShowMenu(showMenu === note.id ? null : note.id)}
                            className="p-2 hover:bg-[#4D4E50] rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-5 h-5 text-[#A0A0A0]" />
                          </button>
                          {showMenu === note.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-[#2D2E30] rounded-lg border border-[#3D3E40] shadow-2xl overflow-hidden z-10">
                              <button className="w-full px-4 py-3 text-left text-white hover:bg-[#3D3E40] transition-colors text-sm">
                                Download
                              </button>
                              <button className="w-full px-4 py-3 text-left text-white hover:bg-[#3D3E40] transition-colors text-sm">
                                Edit Metadata
                              </button>
                              <button className="w-full px-4 py-3 text-left text-white hover:bg-[#3D3E40] transition-colors text-sm">
                                View Details
                              </button>
                              <button className="w-full px-4 py-3 text-left text-red-400 hover:bg-[#3D3E40] transition-colors text-sm">
                                Remove from Repo
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upload Modal */}
          {showUploadModal && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black/60 z-50"
                onClick={() => setShowUploadModal(false)}
              />

              {/* Modal */}
              <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
                <div className="bg-[#1E1F20] rounded-xl border border-[#3D3E40] p-4 lg:p-6 w-full max-w-md pointer-events-auto shadow-2xl max-h-[90vh] overflow-y-auto">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4 lg:mb-6">
                    <div>
                      <h2 className="text-xl lg:text-2xl text-white mb-1">Upload Notes</h2>
                      <p className="text-[#A0A0A0] text-xs lg:text-sm">Add notes to the repository with syllabus information</p>
                    </div>
                    <button
                      onClick={() => setShowUploadModal(false)}
                      className="p-2 hover:bg-[#2D2E30] rounded-lg transition-colors flex-shrink-0"
                    >
                      <X className="w-5 h-5 text-[#A0A0A0]" />
                    </button>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleUploadSubmit} className="space-y-4">
                    {/* Subject Code */}
                    <div>
                      <label className="block text-sm text-[#A0A0A0] mb-2">
                        Subject Code <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., COMP 302"
                        value={uploadForm.subjectCode}
                        onChange={(e) => setUploadForm({ ...uploadForm, subjectCode: e.target.value })}
                        required
                        className="w-full bg-[#2D2E30] border border-[#3D3E40] rounded-lg px-4 py-3 text-white placeholder:text-[#A0A0A0] focus:outline-none focus:border-[#4D4E50]"
                      />
                    </div>

                    {/* Subject Name */}
                    <div>
                      <label className="block text-sm text-[#A0A0A0] mb-2">
                        Subject Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Analysis of Algorithms"
                        value={uploadForm.subjectName}
                        onChange={(e) => setUploadForm({ ...uploadForm, subjectName: e.target.value })}
                        required
                        className="w-full bg-[#2D2E30] border border-[#3D3E40] rounded-lg px-4 py-3 text-white placeholder:text-[#A0A0A0] focus:outline-none focus:border-[#4D4E50]"
                      />
                    </div>

                    {/* Syllabus Topics */}
                    <div>
                      <label className="block text-sm text-[#A0A0A0] mb-2">
                        Syllabus Topics/Sections <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Unit 3 - Graph Theory, Spanning Trees"
                        value={uploadForm.syllabusTopics}
                        onChange={(e) => setUploadForm({ ...uploadForm, syllabusTopics: e.target.value })}
                        required
                        className="w-full bg-[#2D2E30] border border-[#3D3E40] rounded-lg px-4 py-3 text-white placeholder:text-[#A0A0A0] focus:outline-none focus:border-[#4D4E50]"
                      />
                      <p className="text-xs text-[#A0A0A0] mt-1">Which part of the syllabus do these notes cover?</p>
                    </div>

                    {/* File Upload */}
                    <div>
                      <label className="block text-sm text-[#A0A0A0] mb-2">
                        File <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.txt"
                          onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files ? e.target.files[0] : null })}
                          required
                          className="w-full bg-[#2D2E30] border border-[#3D3E40] rounded-lg px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-[#3D3E40] file:text-white hover:file:bg-[#4D4E50] focus:outline-none focus:border-[#4D4E50]"
                        />
                      </div>
                      <p className="text-xs text-[#A0A0A0] mt-1">Accepted formats: PDF, JPG, PNG, TXT</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowUploadModal(false)}
                        className="flex-1 px-4 py-3 bg-[#2D2E30] hover:bg-[#3D3E40] text-white rounded-lg transition-colors border border-[#3D3E40]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-3 bg-[#3D3E40] hover:bg-[#4D4E50] text-white rounded-lg transition-colors"
                      >
                        Upload Notes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}