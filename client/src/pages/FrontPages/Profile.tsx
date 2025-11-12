
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useAuth } from "../../providers/AuthProvider";
import { Link } from "react-router-dom";

export default function ProfilePage() {
  const { hasPermission } = useAuth();

  return (
    <>
      <PageMeta title="Profile" description="User profile" />
      <PageBreadcrumb pageTitle="Profile" />
      <div className="p-4">
        <h2 className="text-xl font-semibold">User Profile</h2>
        {/* ...existing profile details... */}

        {hasPermission("create_course") || hasPermission("edit_course") ? (
          <div className="mt-6 p-4 border rounded">
            <h3 className="font-medium">Course Management</h3>
            <p className="text-sm text-gray-600">You have access to manage courses.</p>
            <div className="mt-3 space-x-2">
              {hasPermission("create_course") && (
                <Link to="/courses" className="px-3 py-2 bg-blue-600 text-white rounded">
                  Create Course
                </Link>
              )}
              {hasPermission("edit_course") && (
                <Link to="/courses" className="px-3 py-2 bg-yellow-500 text-white rounded">
                  Edit Courses
                </Link>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}