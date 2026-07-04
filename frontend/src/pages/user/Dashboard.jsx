import React from "react";
import Layout from "../../components/layout/Layout";
import UserMenu from "../../components/layout/UserMenu";
import { useAuth } from "../../context/Auth";

const Dashboard = () => {
  const [auth] = useAuth();

  return (
    <Layout title={"Dashboard - User Panel"}>
      <div className="container-fluid p-3">
        <div className="row">
          {/* Sidebar */}
          <div className="col-md-3 mb-3">
            <UserMenu />
          </div>

          {/* Main Content */}
          <div className="col-md-9">
            <div className="card shadow border-0">
              <div className="card-header bg-primary text-white">
                <h3 className="mb-0">User Dashboard</h3>
              </div>

              <div className="card-body">
                <div className="mb-3">
                  <h5>
                    <strong>Name:</strong> {auth?.user?.workname}
                  </h5>
                </div>

                <div className="mb-3">
                  <h5>
                    <strong>Email:</strong> {auth?.user?.email}
                  </h5>
                </div>

                <div className="mb-3">
                  <h5>
                    <strong>Phone:</strong> {auth?.user?.phone}
                  </h5>
                </div>

                <div className="mb-3">
                  <h5>
                    <strong>Role:</strong>{" "}
                    {auth?.user?.role === 1 ? "manager" : "Null"}
                  </h5>
                </div>

                <div className="alert alert-success mt-4">
                  Welcome back, {auth?.user?.workname} 👋
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;