import { useState } from 'react';
import { Search, Upload, MoreVertical, CheckCircle, Clock, X } from 'lucide-react';

interface Course {
  id: number;
  uuid: string;
  courseCode: string;
  courseTitle: string;
  semester: string;
  creditHours: number;
  lastUpdated: string;
  status: 'vectorized' | 'pending';
}

export function SyllabusRepository() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState<number | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    subjectCode: '',
    subjectName: '',
    creditHour: '',
    file: null as File | null
  });

  const courses: Course[] = [
    {
      id: 1,
      uuid: '12345678-1234-5678-1234-567812345678',
      courseCode: 'COMP 302',
      courseTitle: 'Analysis of Algorithms',
      semester: 'III/I',
      creditHours: 3,
      lastUpdated: '2024-01-10',
      status: 'vectorized'
    },
    {
      id: 2,
      uuid: '87654321-4321-8765-4321-876543218765',
      courseCode: 'COMP 215',
      courseTitle: 'Database Management Systems',
      semester: 'II/II',
      creditHours: 3,
      lastUpdated: '2024-01-08',
      status: 'vectorized'
    },
    {
      id: 3,
      uuid: '13579246-2468-1357-2468-135792461357',
      courseCode: 'COMP 314',
      courseTitle: 'Computer Networks',
      semester: 'III/II',
      creditHours: 3,
      lastUpdated: '2024-01-15',
      status: 'pending'
    },
    {
      id: 4,
      uuid: '24681357-1357-2468-1357-246813572468',
      courseCode: 'COMP 202',
      courseTitle: 'Data Structures',
      semester: 'II/I',
      creditHours: 3,
      lastUpdated: '2023-12-20',
      status: 'vectorized'
    },
    {
      id: 5,
      uuid: '98765432-3210-9876-3210-987654329876',
      courseCode: 'COMP 401',
      courseTitle: 'Artificial Intelligence',
      semester: 'IV/I',
      creditHours: 3,
      lastUpdated: '2024-01-12',
      status: 'vectorized'
    },
    {
      id: 6,
      uuid: '01234567-7654-0123-7654-012345670123',
      courseCode: 'COMP 308',
      courseTitle: 'Operating Systems',
      semester: 'III/I',
      creditHours: 3,
      lastUpdated: '2024-01-05',
      status: 'vectorized'
    }
  ];

  const getStatusBadge = (status: Course['status']) => {
    if (status === 'vectorized') {
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
      creditHour: '',
      file: null
    });
  };

  return (
    <>
      <div className="flex-1 overflow-auto bg-[#121212] p-4 lg:p-8 pt-16 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl mb-2">Syllabus Repository</h1>
            <p className="text-[#A0A0A0] text-sm lg:text-base">Manage KU course syllabi and vectorized content</p>
          </div>

          {/* Controls */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-[#3D3E40] hover:bg-[#4D4E50] rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Syllabus</span>
            </button>
            
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A0A0]" />
              <input
                type="text"
                placeholder="Search by code or title..."
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
                    <th className="text-left px-4 lg:px-6 py-4 text-[#A0A0A0] text-sm">Course Code</th>
                    <th className="text-left px-4 lg:px-6 py-4 text-[#A0A0A0] text-sm">Course Title</th>
                    <th className="text-left px-4 lg:px-6 py-4 text-[#A0A0A0] text-sm">Year/Sem</th>
                    <th className="text-left px-4 lg:px-6 py-4 text-[#A0A0A0] text-sm">Credit</th>
                    <th className="text-left px-4 lg:px-6 py-4 text-[#A0A0A0] text-sm">Last Updated</th>
                    <th className="text-left px-4 lg:px-6 py-4 text-[#A0A0A0] text-sm">Status</th>
                    <th className="text-right px-4 lg:px-6 py-4 text-[#A0A0A0] text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr
                      key={course.id}
                      className="border-b border-[#3D3E40] hover:bg-[#3D3E40]/30 transition-colors"
                    >
                      <td className="px-4 lg:px-6 py-4 text-white text-sm">{course.courseCode}</td>
                      <td className="px-4 lg:px-6 py-4 text-white text-sm">{course.courseTitle}</td>
                      <td className="px-4 lg:px-6 py-4 text-[#A0A0A0] text-sm">{course.semester}</td>
                      <td className="px-4 lg:px-6 py-4 text-[#A0A0A0] text-sm">{course.creditHours} Credit Hour(s)</td>
                      <td className="px-4 lg:px-6 py-4 text-[#A0A0A0] text-sm">{course.lastUpdated}</td>
                      <td className="px-4 lg:px-6 py-4">{getStatusBadge(course.status)}</td>
                      <td className="px-4 lg:px-6 py-4 text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={() => setShowMenu(showMenu === course.id ? null : course.id)}
                            className="p-2 hover:bg-[#4D4E50] rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-5 h-5 text-[#A0A0A0]" />
                          </button>
                          {showMenu === course.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-[#2D2E30] rounded-lg border border-[#3D3E40] shadow-2xl overflow-hidden z-10">
                              <button className="w-full px-4 py-3 text-left text-white hover:bg-[#3D3E40] transition-colors text-sm">
                                Edit
                              </button>
                              <button className="w-full px-4 py-3 text-left text-white hover:bg-[#3D3E40] transition-colors text-sm">
                                Re-index
                              </button>
                              <button className="w-full px-4 py-3 text-left text-red-400 hover:bg-[#3D3E40] transition-colors text-sm">
                                Delete
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
                      <h2 className="text-xl lg:text-2xl text-white mb-1">Upload Syllabus PDF</h2>
                      <p className="text-[#A0A0A0] text-xs lg:text-sm">Add course syllabus with subject information</p>
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

                    {/* Credit Hour */}
                    <div>
                      <label className="block text-sm text-[#A0A0A0] mb-2">
                        Credit Hour <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={uploadForm.creditHour}
                        onChange={(e) => setUploadForm({ ...uploadForm, creditHour: e.target.value })}
                        required
                        className="w-full bg-[#2D2E30] border border-[#3D3E40] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#4D4E50]"
                      >
                        <option value="" disabled>Select credit hour</option>
                        <option value="1">1 Credit Hour</option>
                        <option value="2">2 Credit Hours</option>
                        <option value="3">3 Credit Hours</option>
                        <option value="4">4 Credit Hours</option>
                        <option value="5">5 Credit Hours</option>
                        <option value="6">6 Credit Hours</option>
                      </select>
                      <p className="text-xs text-[#A0A0A0] mt-1">Select the credit hour value for this subject</p>
                    </div>

                    {/* File Upload */}
                    <div>
                      <label className="block text-sm text-[#A0A0A0] mb-2">
                        Syllabus PDF File <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files ? e.target.files[0] : null })}
                          required
                          className="w-full bg-[#2D2E30] border border-[#3D3E40] rounded-lg px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-[#3D3E40] file:text-white hover:file:bg-[#4D4E50] focus:outline-none focus:border-[#4D4E50]"
                        />
                      </div>
                      <p className="text-xs text-[#A0A0A0] mt-1">Accepted format: PDF only</p>
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
                        Upload Syllabus
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