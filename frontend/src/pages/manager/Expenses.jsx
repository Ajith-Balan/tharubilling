import React from "react";
import Layout from "../../components/layout/Layout";
const Expenses = () => {
  const transactions = [
    {
      date: "2026-07-01",
      description: "Opening Balance",
      category: "Balance",
      debit: 0,
      credit: 100000,
    },
    {
      date: "2026-07-02",
      description: "Office Rent",
      category: "Expense",
      debit: 20000,
      credit: 0,
    },
    {
      date: "2026-07-03",
      description: "Purchase - Laptop",
      category: "Purchase",
      debit: 55000,
      credit: 0,
    },
    {
      date: "2026-07-05",
      description: "Client Payment",
      category: "Income",
      debit: 0,
      credit: 85000,
    },
    {
      date: "2026-07-06",
      description: "Electricity Bill",
      category: "Expense",
      debit: 3500,
      credit: 0,
    },
    {
      date: "2026-07-08",
      description: "Internet",
      category: "Expense",
      debit: 1200,
      credit: 0,
    },
    {
      date: "2026-07-09",
      description: "Stationery Purchase",
      category: "Purchase",
      debit: 4500,
      credit: 0,
    },
  ];

  let balance = 0;

  const totalDebit = transactions.reduce(
    (sum, item) => sum + item.debit,
    0
  );

  const totalCredit = transactions.reduce(
    (sum, item) => sum + item.credit,
    0
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Monthly Day Book
            </h1>
            <p className="text-gray-500">
              Manage Expenses, Purchases & Income
            </p>
          </div>

          <div className="flex gap-3">
            <input
              type="month"
              className="border rounded-lg px-4 py-2"
            />

            <input
              type="text"
              placeholder="Search..."
              className="border rounded-lg px-4 py-2"
            />
          </div>
        </div>

        {/* Summary Cards */}

        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-5 mb-6">

          <div className="bg-white rounded-xl shadow p-5 border-l-4 border-red-500">
            <h3 className="text-gray-500">Total Debit</h3>
            <h2 className="text-2xl font-bold text-red-600">
              ₹ {totalDebit.toLocaleString()}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-5 border-l-4 border-green-500">
            <h3 className="text-gray-500">Total Credit</h3>
            <h2 className="text-2xl font-bold text-green-600">
              ₹ {totalCredit.toLocaleString()}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-5 border-l-4 border-blue-500">
            <h3 className="text-gray-500">Closing Balance</h3>
            <h2 className="text-2xl font-bold text-blue-600">
              ₹ {(totalCredit - totalDebit).toLocaleString()}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-5 border-l-4 border-yellow-500">
            <h3 className="text-gray-500">Transactions</h3>
            <h2 className="text-2xl font-bold text-yellow-600">
              {transactions.length}
            </h2>
          </div>

        </div>

        {/* Table */}

        <div className="bg-white rounded-xl shadow overflow-auto">

          <table className="w-full">

            <thead className="bg-gray-800 text-white">

              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-right">Debit</th>
                <th className="p-3 text-right">Credit</th>
                <th className="p-3 text-right">Balance</th>
              </tr>

            </thead>

            <tbody>

              {transactions.map((item, index) => {
                balance = balance + item.credit - item.debit;

                return (
                  <tr
                    key={index}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="p-3">{item.date}</td>

                    <td className="p-3 font-medium">
                      {item.description}
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold

                        ${
                          item.category === "Expense"
                            ? "bg-red-100 text-red-600"
                            : item.category === "Income"
                            ? "bg-green-100 text-green-600"
                            : item.category === "Purchase"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-blue-100 text-blue-600"
                        }
                        `}
                      >
                        {item.category}
                      </span>
                    </td>

                    <td className="p-3 text-right text-red-600 font-semibold">
                      {item.debit
                        ? `₹ ${item.debit.toLocaleString()}`
                        : "-"}
                    </td>

                    <td className="p-3 text-right text-green-600 font-semibold">
                      {item.credit
                        ? `₹ ${item.credit.toLocaleString()}`
                        : "-"}
                    </td>

                    <td
                      className={`p-3 text-right font-bold ${
                        balance >= 0
                          ? "text-blue-600"
                          : "text-red-600"
                      }`}
                    >
                      ₹ {balance.toLocaleString()}
                    </td>
                  </tr>
                );
              })}

            </tbody>

            <tfoot className="bg-gray-100 font-bold">

              <tr>
                <td colSpan="3" className="p-3 text-right">
                  Total
                </td>

                <td className="p-3 text-right text-red-600">
                  ₹ {totalDebit.toLocaleString()}
                </td>

                <td className="p-3 text-right text-green-600">
                  ₹ {totalCredit.toLocaleString()}
                </td>

                <td className="p-3 text-right text-blue-700">
                  ₹ {(totalCredit - totalDebit).toLocaleString()}
                </td>
              </tr>

            </tfoot>

          </table>

        </div>

      </div>
    </Layout>
  );
};

export default Expenses;