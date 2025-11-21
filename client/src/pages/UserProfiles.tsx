import PageBreadcrumb from "../components/common/PageBreadCrumb";
import StudentDashboard from "../components/Student/StudentDashboard";
import PageMeta from "../components/common/PageMeta";

export default function UserProfiles() {
  return (
    <>
      <PageMeta
        title="Student Dashboard | Learning Management System"
        description="Track your course progress, view certificates, and manage your learning journey"
      />
      <PageBreadcrumb pageTitle="Student Dashboard" />
      
      <StudentDashboard />
    </>
  );
}
