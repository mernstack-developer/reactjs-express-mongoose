import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";

export default function AboutUs () {
    return (
        <>
            <PageMeta title="About Us" description="Learn more about our mission and values." />
            <PageBreadcrumb pageTitle="About Us"  />
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold">About Us</h1>
                <p className="mt-4">
                    We are a team of passionate individuals committed to delivering the best educational resources.
                </p>
                <ComponentCard title="Our Mission" desc="To empower learners through accessible education." >
                    <p className="mt-2">
                        Our mission is to provide high-quality educational materials that are accessible to everyone, everywhere.
                    </p>
                </ComponentCard>
            </div>
        </>
    );
}       

