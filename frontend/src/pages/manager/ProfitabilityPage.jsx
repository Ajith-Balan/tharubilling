import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
const ProfitabilityPage = () => {
  const [data, setData] = useState([
    {
      id: 1,
      contractName: "Kochi Metro Contract",
      creditedAmount: 500000,
      monthlyExpenses: 250000,
      purchase: 50000,
      bgReturn: 20000,
      paidBg: 10000,
    },
    {
      id: 2,
      contractName: "Airport Security Contract",
      creditedAmount: 750000,
      monthlyExpenses: 350000,
      purchase: 70000,
      bgReturn: 30000,
      paidBg: 15000,
    },
    {
      id: 3,
      contractName: "Railway Maintenance Contract",
      creditedAmount: 900000,
      monthlyExpenses: 450000,
      purchase: 90000,
      bgReturn: 40000,
      paidBg: 20000,
    },
  ]);

  const handleChange = (index, field, value) => {
    const updated = [...data];
    updated[index][field] =
      field === "contractName" ? value : Number(value);
    setData(updated);
  };

  const totalCredit = data.reduce(
    (sum, row) => sum + row.creditedAmount,
    0
  );

  const totalExpenses = data.reduce(
    (sum, row) => sum + row.monthlyExpenses,
    0
  );

  const totalProfit = data.reduce(
    (sum, row) =>
      sum +
      (
        row.creditedAmount -
        row.monthlyExpenses -
        row.purchase +
        row.bgReturn -
        row.paidBg
      ),
    0
  );

  return (

    <Layout title="Profitability Sheet" >
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Toolbar */}
        <div className="border-b px-4 py-3 flex justify-between items-center bg-gray-50">
          <h1 className="text-2xl font-bold">
            Profitability Sheet
          </h1>

          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Export Excel
          </button>
        </div>

        {/* Table */}
        <div className="overflow-auto">
          <table className="min-w-full border-collapse">
            <thead className="sticky top-0 bg-green-700 text-white z-10">
              <tr>
                <th className="border p-3 min-w-[60px]">#</th>
                <th className="border p-3 min-w-[250px] text-left">
                  Contract Name
                </th>
                <th className="border p-3 min-w-[180px]">
                  Credited Amount
                </th>
                <th className="border p-3 min-w-[180px]">
                  Monthly Expenses
                </th>
                <th className="border p-3 min-w-[150px]">
                  Purchase
                </th>
                <th className="border p-3 min-w-[150px]">
                  BG Return
                </th>
                <th className="border p-3 min-w-[150px]">
                  Paid BG
                </th>
                <th className="border p-3 min-w-[180px]">
                  Profit / Loss
                </th>
              </tr>
            </thead>

            <tbody>
              {data.map((row, index) => {
                const profit =
                  row.creditedAmount -
                  row.monthlyExpenses -
                  row.purchase +
                  row.bgReturn -
                  row.paidBg;

                return (
                  <tr
                    key={row.id}
                    className="hover:bg-green-50"
                  >
                    <td className="border p-2 text-center">
                      {index + 1}
                    </td>

                    <td className="border p-1">
                      <input
                        value={row.contractName}
                        onChange={(e) =>
                          handleChange(
                            index,
                            "contractName",
                            e.target.value
                          )
                        }
                        className="w-full p-2 outline-none"
                      />
                    </td>

                    <td className="border p-1">
                      <input
                        type="number"
                        value={row.creditedAmount}
                        onChange={(e) =>
                          handleChange(
                            index,
                            "creditedAmount",
                            e.target.value
                          )
                        }
                        className="w-full p-2 outline-none text-right"
                      />
                    </td>

                    <td className="border p-1">
                      <input
                        type="number"
                        value={row.monthlyExpenses}
                        onChange={(e) =>
                          handleChange(
                            index,
                            "monthlyExpenses",
                            e.target.value
                          )
                        }
                        className="w-full p-2 outline-none text-right"
                      />
                    </td>

                    <td className="border p-1">
                      <input
                        type="number"
                        value={row.purchase}
                        onChange={(e) =>
                          handleChange(
                            index,
                            "purchase",
                            e.target.value
                          )
                        }
                        className="w-full p-2 outline-none text-right"
                      />
                    </td>

                    <td className="border p-1">
                      <input
                        type="number"
                        value={row.bgReturn}
                        onChange={(e) =>
                          handleChange(
                            index,
                            "bgReturn",
                            e.target.value
                          )
                        }
                        className="w-full p-2 outline-none text-right"
                      />
                    </td>

                    <td className="border p-1">
                      <input
                        type="number"
                        value={row.paidBg}
                        onChange={(e) =>
                          handleChange(
                            index,
                            "paidBg",
                            e.target.value
                          )
                        }
                        className="w-full p-2 outline-none text-right"
                      />
                    </td>

                    <td
                      className={`border p-3 font-semibold text-right ${
                        profit >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      ₹{profit.toLocaleString()}
                    </td>
                  </tr>
                );
              })}

              {/* Totals Row */}
              <tr className="bg-yellow-100 font-bold sticky bottom-0">
                <td
                  colSpan={2}
                  className="border p-3 text-right"
                >
                  TOTAL
                </td>

                <td className="border p-3 text-right">
                  ₹{totalCredit.toLocaleString()}
                </td>

                <td className="border p-3 text-right">
                  ₹{totalExpenses.toLocaleString()}
                </td>

                <td className="border p-3"></td>
                <td className="border p-3"></td>
                <td className="border p-3"></td>

                <td className="border p-3 text-green-700 text-right">
                  ₹{totalProfit.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </Layout>
  );
};

export default ProfitabilityPage;