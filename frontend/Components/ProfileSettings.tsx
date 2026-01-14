import { X, User, Mail, Phone, Calendar, MapPin, GraduationCap } from 'lucide-react';
import { useState } from 'react';

interface ProfileSettingsProps {
  onClose: () => void;
}

export function ProfileSettings({ onClose }: ProfileSettingsProps) {
  const [formData, setFormData] = useState({
    fullName: 'Rajesh Kumar Shrestha',
    email: 'rajesh.shrestha@ku.edu.np',
    phone: '+977 9841234567',
    dateOfBirth: '1999-05-15',
    address: 'Dhulikhel, Kavre',
    studentId: 'KU2020CS001',
    department: 'Computer Science',
    semester: '6th Semester',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Handle save logic here
    console.log('Saving profile:', formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1E1F20] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-[#2D2E30]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2D2E30]">
          <h2 className="text-2xl text-white">Profile Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#2D2E30] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#A0A0A0]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="space-y-6">
            {/* Profile Picture */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-[#3D3E40] rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-10 h-10 text-white" />
              </div>
              <button className="px-4 py-2 bg-[#3D3E40] hover:bg-[#4D4E50] rounded-lg transition-colors text-white text-sm">
                Change Photo
              </button>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-white text-lg">Personal Information</h3>
              
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-[#A0A0A0] text-sm flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  className="w-full bg-[#2D2E30] text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-[#4D4E50] transition-all"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-[#A0A0A0] text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full bg-[#2D2E30] text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-[#4D4E50] transition-all"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-[#A0A0A0] text-sm flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full bg-[#2D2E30] text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-[#4D4E50] transition-all"
                />
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <label className="text-[#A0A0A0] text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                  className="w-full bg-[#2D2E30] text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-[#4D4E50] transition-all"
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label className="text-[#A0A0A0] text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full bg-[#2D2E30] text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-[#4D4E50] transition-all"
                />
              </div>
            </div>

            {/* Academic Information */}
            <div className="space-y-4 pt-4 border-t border-[#2D2E30]">
              <h3 className="text-white text-lg">Academic Information</h3>
              
              {/* Student ID */}
              <div className="space-y-2">
                <label className="text-[#A0A0A0] text-sm flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Student ID
                </label>
                <input
                  type="text"
                  value={formData.studentId}
                  disabled
                  className="w-full bg-[#2D2E30] text-[#A0A0A0] px-4 py-3 rounded-lg outline-none opacity-60 cursor-not-allowed"
                />
              </div>

              {/* Department */}
              <div className="space-y-2">
                <label className="text-[#A0A0A0] text-sm">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  className="w-full bg-[#2D2E30] text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-[#4D4E50] transition-all"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Computer Engineering">Computer Engineering</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                </select>
              </div>

              {/* Semester */}
              <div className="space-y-2">
                <label className="text-[#A0A0A0] text-sm">Current Semester</label>
                <select
                  value={formData.semester}
                  onChange={(e) => handleChange('semester', e.target.value)}
                  className="w-full bg-[#2D2E30] text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-[#4D4E50] transition-all"
                >
                  <option value="1st Semester">1st Semester</option>
                  <option value="2nd Semester">2nd Semester</option>
                  <option value="3rd Semester">3rd Semester</option>
                  <option value="4th Semester">4th Semester</option>
                  <option value="5th Semester">5th Semester</option>
                  <option value="6th Semester">6th Semester</option>
                  <option value="7th Semester">7th Semester</option>
                  <option value="8th Semester">8th Semester</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#2D2E30]">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-[#2D2E30] hover:bg-[#3D3E40] rounded-lg transition-colors text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-[#3D3E40] hover:bg-[#4D4E50] rounded-lg transition-colors text-white"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
