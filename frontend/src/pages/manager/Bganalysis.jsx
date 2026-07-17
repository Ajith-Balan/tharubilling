import React from "react";
import Layout from "../../components/layout/Layout";

const bgData = [
  {
    bgNo: "BG-1001",
    bank: "SBI",
    project: "Metro Station",
    amount: 2500000,
    issueDate: "2025-01-10",
    expiryDate: "2026-12-31",
    status: "Active",
  },
  {
    bgNo: "BG-1002",
    bank: "HDFC",
    project: "Hospital Block",
    amount: 1800000,
    issueDate: "2024-05-20",
    expiryDate: "2025-05-20",
    status: "Expired",
  },
  {
    bgNo: "BG-1003",
    bank: "Canara Bank",
    project: "Bridge Work",
    amount: 3200000,
    issueDate: "2025-03-15",
    expiryDate: "2027-03-14",
    status: "Returned",
  },
  {
    bgNo: "BG-1004",
    bank: "ICICI",
    project: "Highway Project",
    amount: 950000,
    issueDate: "2024-07-01",
    expiryDate: "2025-07-01",
    status: "Paid",
  },
  {
    bgNo: "BG-1005",
    bank: "Federal Bank",
    project: "Office Complex",
    amount: 1450000,
    issueDate: "2025-11-01",
    expiryDate: "2026-08-15",
    status: "Expiring Soon",
  },
];

const Bganalysis = () => {
  const totalBG = bgData.length;

  const totalValue = bgData.reduce((a, b) => a + b.amount, 0);

  const active = bgData.filter((b) => b.status === "Active");

  const expired = bgData.filter((b) => b.status === "Expired");

  const returned = bgData.filter((b) => b.status === "Returned");

  const paid = bgData.filter((b) => b.status === "Paid");

  const expiring = bgData.filter((b) => b.status === "Expiring Soon");

  return (
    <Layout>
      <div className="min-h-screen bg-slate-100 p-6">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Bank Guarantee Analysis
          </h1>

          <p className="text-gray-500">
            Monitor all Bank Guarantees in one place
          </p>
        </div>

        {/* Summary */}

        <div className="grid lg:grid-cols-3 xl:grid-cols-6 md:grid-cols-2 gap-5 mb-8">

          <SummaryCard
            title="Total BG"
            value={totalBG}
            color="blue"
          />

          <SummaryCard
            title="Total Value"
            value={`₹ ${totalValue.toLocaleString()}`}
            color="green"
          />

          <SummaryCard
            title="Active"
            value={active.length}
            color="emerald"
          />

          <SummaryCard
            title="Expired"
            value={expired.length}
            color="red"
          />

          <SummaryCard
            title="Returned"
            value={returned.length}
            color="purple"
          />

          <SummaryCard
            title="Paid"
            value={paid.length}
            color="orange"
          />

        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Table */}

          <div className="lg:col-span-2 bg-white rounded-2xl shadow">

            <div className="p-5 border-b">

              <h2 className="font-bold text-xl">
                Bank Guarantee Register
              </h2>

            </div>

            <div className="overflow-auto">

              <table className="w-full">

                <thead className="bg-gray-100">

                  <tr>

                    <th className="p-3 text-left">BG No</th>
                    <th className="text-left">Bank</th>
                    <th>Project</th>
                    <th>Amount</th>
                    <th>Expiry</th>
                    <th>Status</th>

                  </tr>

                </thead>

                <tbody>

                  {bgData.map((bg) => (

                    <tr
                      key={bg.bgNo}
                      className="border-b hover:bg-gray-50"
                    >

                      <td className="p-3 font-semibold">
                        {bg.bgNo}
                      </td>

                      <td>{bg.bank}</td>

                      <td>{bg.project}</td>

                      <td className="text-center">
                        ₹ {bg.amount.toLocaleString()}
                      </td>

                      <td className="text-center">
                        {bg.expiryDate}
                      </td>

                      <td className="text-center">

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold

                          ${
                            bg.status === "Active"
                              ? "bg-green-100 text-green-700"

                              : bg.status === "Expired"
                              ? "bg-red-100 text-red-700"

                              : bg.status === "Returned"
                              ? "bg-purple-100 text-purple-700"

                              : bg.status === "Paid"
                              ? "bg-orange-100 text-orange-700"

                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {bg.status}
                        </span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

          {/* Right */}

          <div className="space-y-5">

            <div className="bg-white rounded-2xl shadow p-5">

              <h2 className="font-bold mb-5">
                BG Status Summary
              </h2>

              <Progress title="Active" value={active.length} total={totalBG} color="bg-green-500" />

              <Progress title="Expired" value={expired.length} total={totalBG} color="bg-red-500" />

              <Progress title="Returned" value={returned.length} total={totalBG} color="bg-purple-500" />

              <Progress title="Paid" value={paid.length} total={totalBG} color="bg-orange-500" />

              <Progress title="Expiring Soon" value={expiring.length} total={totalBG} color="bg-yellow-500" />

            </div>

            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-2xl text-white p-6">

              <h2 className="text-xl font-bold">
                BG Financial Overview
              </h2>

              <div className="mt-5 space-y-3">

                <div className="flex justify-between">
                  <span>Total BG Value</span>
                  <span>₹ {totalValue.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span>Returned</span>
                  <span>{returned.length}</span>
                </div>

                <div className="flex justify-between">
                  <span>Expired</span>
                  <span>{expired.length}</span>
                </div>

                <div className="flex justify-between">
                  <span>Paid</span>
                  <span>{paid.length}</span>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </Layout>
  );
};

const colors = {
  blue: "border-blue-500",
  green: "border-green-500",
  emerald: "border-emerald-500",
  red: "border-red-500",
  purple: "border-purple-500",
  orange: "border-orange-500",
};

const SummaryCard = ({ title, value, color }) => (
  <div className={`bg-white rounded-xl shadow p-5 border-t-4 ${colors[color]}`}>
    <p className="text-gray-500">{title}</p>
    <h2 className="text-2xl font-bold mt-2">{value}</h2>
  </div>
);

const Progress = ({ title, value, total, color }) => {
  const width = (value / total) * 100;

  return (
    <div className="mb-5">
      <div className="flex justify-between mb-1">
        <span>{title}</span>
        <span>{value}</span>
      </div>

      <div className="bg-gray-200 h-3 rounded-full">
        <div
          className={`${color} h-3 rounded-full`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
};

export default Bganalysis;