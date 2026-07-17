import React from "react";
import Layout from "../../components/layout/Layout";
const Subcontract = () => {
  const contracts = [
    {
      id: "SC-001",
      contractor: "ABC Engineering",
      project: "Metro Station",
      value: 1250000,
      paid: 850000,
      progress: 68,
      status: "Active",
    },
    {
      id: "SC-002",
      contractor: "Royal Builders",
      project: "Hospital Block",
      value: 980000,
      paid: 980000,
      progress: 100,
      status: "Completed",
    },
    {
      id: "SC-003",
      contractor: "Vision Infra",
      project: "School Building",
      value: 540000,
      paid: 210000,
      progress: 39,
      status: "Pending",
    },
  ];

  return (
    <Layout className="min-h-screen bg-slate-100 p-6">

      {/* Header */}

      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Sub Contract Dashboard
          </h1>

          <p className="text-gray-500">
            Overview of all subcontract activities
          </p>
        </div>

        <button className="bg-blue-600 text-white px-5 py-3 rounded-xl shadow hover:bg-blue-700">
          + New Contract
        </button>

      </div>

      {/* Summary */}

      <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mb-8">

        <Card title="Total Contracts" value="152" color="blue" />

        <Card title="Active" value="84" color="green" />

        <Card title="Completed" value="52" color="purple" />

        <Card title="Pending Bills" value="16" color="red" />

        <Card title="Contract Value" value="₹4.82 Cr" color="yellow" />

        <Card title="Paid Amount" value="₹3.69 Cr" color="emerald" />

        <Card title="Balance" value="₹1.13 Cr" color="orange" />

        <Card title="Average Progress" value="74%" color="indigo" />

      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Left */}

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">

          <div className="flex justify-between mb-5">

            <h2 className="font-bold text-xl">
              Recent Sub Contracts
            </h2>

            <input
              className="border rounded-lg px-4 py-2"
              placeholder="Search..."
            />

          </div>

          <table className="w-full">

            <thead className="border-b bg-gray-50">

              <tr>

                <th className="text-left p-3">Contract</th>

                <th className="text-left">Project</th>

                <th>Value</th>

                <th>Paid</th>

                <th>Status</th>

              </tr>

            </thead>

            <tbody>

              {contracts.map((item) => (

                <tr key={item.id} className="border-b hover:bg-gray-50">

                  <td className="p-3">
                    <p className="font-semibold">{item.contractor}</p>

                    <small className="text-gray-500">
                      {item.id}
                    </small>
                  </td>

                  <td>{item.project}</td>

                  <td className="text-center">
                    ₹ {item.value.toLocaleString()}
                  </td>

                  <td className="text-center text-green-600 font-semibold">
                    ₹ {item.paid.toLocaleString()}
                  </td>

                  <td>

                    <span
                      className={`px-3 py-1 rounded-full text-sm

                      ${
                        item.status === "Completed"
                          ? "bg-green-100 text-green-700"

                          : item.status === "Active"
                          ? "bg-blue-100 text-blue-700"

                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.status}
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {/* Right */}

        <div className="space-y-6">

          <div className="bg-white rounded-2xl shadow-lg p-6">

            <h3 className="font-bold mb-5">
              Contract Progress
            </h3>

            {contracts.map((item) => (

              <div key={item.id} className="mb-5">

                <div className="flex justify-between">

                  <span>{item.contractor}</span>

                  <span>{item.progress}%</span>

                </div>

                <div className="bg-gray-200 rounded-full h-3 mt-2">

                  <div
                    className="bg-blue-600 h-3 rounded-full"
                    style={{
                      width: `${item.progress}%`,
                    }}
                  />

                </div>

              </div>

            ))}

          </div>

          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl text-white p-6">

            <h2 className="text-lg font-semibold">
              Monthly Summary
            </h2>

            <div className="mt-5 space-y-3">

              <div className="flex justify-between">
                <span>New Contracts</span>
                <span>12</span>
              </div>

              <div className="flex justify-between">
                <span>Completed</span>
                <span>8</span>
              </div>

              <div className="flex justify-between">
                <span>Pending Bills</span>
                <span>16</span>
              </div>

              <div className="flex justify-between">
                <span>Revenue</span>
                <span>₹42.5 Lakh</span>
              </div>

            </div>

          </div>

        </div>

      </div>

    </Layout>
  );
};

const Card = ({ title, value, color }) => (
  <div
    className={`bg-white rounded-2xl shadow-lg p-6 border-t-4 border-${color}-500`}
  >
    <p className="text-gray-500">{title}</p>

    <h2 className="text-3xl font-bold mt-2">{value}</h2>
  </div>
);

export default Subcontract;