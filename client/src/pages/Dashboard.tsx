
import  PageMeta  from '../components/common/PageMeta';
import  PageBreadcrumb  from '../components/common/PageBreadCrumb';
import DashboardRouter from '../components/DashboardRouter';

export default function Dashboard() {
  return (
    <>
      <PageMeta title="Dashboard" description="User dashboard" />
      <PageBreadcrumb pageTitle="Dashboard" />
      <DashboardRouter />
    </>
  );
}