import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User } from "lucide-react";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  return (
    <div className="h-screen pt-20">
      <div className="max-w-3xl mx-auto p-6 py-10 bg-base-100 rounded-2xl shadow-lg space-y-8">
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">Profile</h1>
          <p className="mt-2 text-sm text-zinc-500">Manage and update your profile information</p>
        </div>

        {/* Avatar Upload Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <img
              src={selectedImg || authUser.profilePic || "/avatar.png"}
              alt="Profile"
              className="w-40 h-40 rounded-full object-cover border-4 border-primary shadow-md"
            />
            <label
              htmlFor="avatar-upload"
              className={`
                absolute bottom-2 right-2 
                bg-primary hover:bg-primary-focus hover:scale-105
                p-2.5 rounded-full cursor-pointer 
                transition-all duration-200 shadow-md
                ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
              `}
            >
              <Camera className="w-5 h-5 text-white" />
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUpdatingProfile}
              />
            </label>
          </div>
          <p className="text-sm text-zinc-500">
            {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
          </p>
        </div>

        {/* Profile Information Section */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="text-sm text-zinc-400 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <span className="font-medium text-zinc-300">Full Name</span>
            </div>
            <p className="px-4 py-3 bg-base-200 rounded-lg border border-zinc-700 text-zinc-200">
              {authUser?.fullName || "Not provided"}
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-zinc-400 flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              <span className="font-medium text-zinc-300">Email Address</span>
            </div>
            <p className="px-4 py-3 bg-base-200 rounded-lg border border-zinc-700 text-zinc-200">
              {authUser?.email || "Not provided"}
            </p>
          </div>
        </div>

        {/* Account Information Section */}
        <div className="bg-base-300 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-primary mb-4">Account Information</h2>
          <div className="space-y-3 text-sm text-zinc-400">
            <div className="flex items-center justify-between py-2 border-b border-zinc-700">
              <span>Member Since</span>
              <span className="text-zinc-200">{authUser.createdAt?.split("T")[0] || "N/A"}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span>Account Status</span>
              <span className="text-green-500 font-medium">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;