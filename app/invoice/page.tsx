"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Link from "next/link";

type Item = {
  id: string;
  name: string;
  qty: number;
  price: number;
};

export default function InvoicePage({ params }: { params: { orderId: string } }) {
  const { orderId } = params ?? { orderId: "0001" };

  const [company] = useState({
    name: "King Shoppers Pvt. Ltd.",
    address: "123 Market Street, Mumbai, Maharashtra",
    phone: "+91 98765 43210",
    email: "hello@kingshoppers.com",
    gst: "27AAAPL1234C1ZQ",
    logoUrl: "/logo.png", // optional
  });

  const [customer, setCustomer] = useState({
    name: "John Doe",
    email: "john@example.com",
    phone: "9876543210",
    address: "Flat 12, Palm Residency, Pune, Maharashtra",
  });

  const [items, setItems] = useState<Item[]>([
    { id: "1", name: "Wireless Earbuds", qty: 1, price: 1299 },
    { id: "2", name: "Smart Watch", qty: 2, price: 1599 },
  ]);

  const taxRate = 0.18;
  const shipping = 49;

  const subtotal = items.reduce((acc, it) => acc + it.qty * it.price, 0);
  const tax = subtotal * taxRate;
  const grandTotal = subtotal + tax + shipping;

  const updateQty = (id: string, qty: number) => {
    setItems((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, qty: Math.max(0, Math.floor(qty)) } : p
      )
    );
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const leftMargin = 40;
    let cursorY = 40;

    doc.setFontSize(18).setFont("helvetica", "bold");
    doc.text(company.name, leftMargin, cursorY);
    doc.setFontSize(10).setFont("helvetica", "normal");
    doc.text(company.address, leftMargin, cursorY + 18);
    doc.text(`Phone: ${company.phone} | Email: ${company.email}`, leftMargin, cursorY + 34);
    doc.text(`GSTIN: ${company.gst}`, leftMargin, cursorY + 50);

    const rightX = pageWidth - 200;
    doc.setFontSize(12).setFont("helvetica", "bold");
    doc.text(`Invoice`, rightX, cursorY);
    doc.setFontSize(10);
    doc.text(`Invoice #: ${orderId}`, rightX, cursorY + 18);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, rightX, cursorY + 34);

    cursorY += 80;

    doc.setFontSize(11).setFont("helvetica", "bold");
    doc.text("Bill To:", leftMargin, cursorY);
    doc.setFont("helvetica", "normal");
    doc.text(customer.name, leftMargin, cursorY + 16);
    doc.text(customer.address, leftMargin, cursorY + 32);
    doc.text(`Email: ${customer.email} | Phone: ${customer.phone}`, leftMargin, cursorY + 48);

    cursorY += 80;

    const tableBody = items.map((it, idx) => [
      idx + 1,
      it.name,
      it.qty,
      `₹${it.price.toFixed(2)}`,
      `₹${(it.qty * it.price).toFixed(2)}`,
    ]);

    autoTable(doc as any, {
      head: [["#", "Item & Description", "Qty", "Price", "Total"]],
      body: tableBody,
      startY: cursorY,
      margin: { left: leftMargin, right: 40 },
      headStyles: { fillColor: [25, 118, 210] },
      styles: { fontSize: 10, cellPadding: 6 },
    });

    const finalY = (doc as any).lastAutoTable.finalY || cursorY + 100;
    doc.setFontSize(11).setFont("helvetica", "bold");
    doc.text(`Subtotal:`, pageWidth - 200, finalY + 30);
    doc.text(`₹${subtotal.toFixed(2)}`, pageWidth - 70, finalY + 30, { align: "right" });
    doc.text(`GST (${(taxRate * 100).toFixed(0)}%):`, pageWidth - 200, finalY + 48);
    doc.text(`₹${tax.toFixed(2)}`, pageWidth - 70, finalY + 48, { align: "right" });
    doc.text(`Shipping:`, pageWidth - 200, finalY + 66);
    doc.text(`₹${shipping.toFixed(2)}`, pageWidth - 70, finalY + 66, { align: "right" });

    doc.setLineWidth(0.5).line(pageWidth - 260, finalY + 78, pageWidth - 40, finalY + 78);
    doc.setFontSize(13).setFont("helvetica", "bold");
    doc.text(`Grand Total: ₹${grandTotal.toFixed(2)}`, pageWidth - 40, finalY + 98, { align: "right" });

    doc.setFontSize(10).setFont("helvetica", "normal");
    doc.text(
      "Thank you for shopping with us! For refund or return queries, visit our Return Policy page or contact support@kingshoppers.com",
      leftMargin,
      finalY + 140,
      { maxWidth: pageWidth - 80 }
    );

    doc.save(`invoice-${orderId}.pdf`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl overflow-hidden border">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b bg-gray-50">
          <div>
            <h1 className="text-2xl font-bold text-blue-700">{company.name}</h1>
            <p className="text-sm text-gray-600">{company.address}</p>
            <p className="text-sm text-gray-600">GST: {company.gst}</p>
            <p className="text-sm text-gray-600">Email: {company.email}</p>
          </div>
          <div className="mt-4 sm:mt-0 text-right">
            <p className="text-sm text-gray-500">Invoice</p>
            <p className="text-lg font-semibold text-gray-800">#{orderId}</p>
            <p className="text-sm text-gray-500">{new Date().toLocaleDateString()}</p>
            <Link href="/" className="inline-block mt-2 text-blue-600 hover:underline text-xs">
              ← Back to shop
            </Link>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Bill To + Summary */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-sm font-semibold text-gray-700">Bill To</h2>
              <input
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                className="mt-2 w-full border rounded-lg px-3 py-2 text-sm focus:ring focus:ring-blue-100"
              />
              <textarea
                value={customer.address}
                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                className="mt-2 w-full border rounded-lg px-3 py-2 text-sm focus:ring focus:ring-blue-100"
                rows={3}
              />
              <div className="flex gap-3 mt-2">
                <input
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring focus:ring-blue-100"
                  placeholder="Email"
                />
                <input
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  className="w-40 border rounded-lg px-3 py-2 text-sm focus:ring focus:ring-blue-100"
                  placeholder="Phone"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg text-sm">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Summary</h2>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>GST ({(taxRate * 100).toFixed(0)}%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Shipping</span>
                <span>₹{shipping.toFixed(2)}</span>
              </div>
              <div className="border-t mt-2 pt-2 flex justify-between font-semibold text-gray-800">
                <span>Total</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="py-3 px-4 text-left">#</th>
                  <th className="py-3 px-4 text-left">Item</th>
                  <th className="py-3 px-4 text-left">Qty</th>
                  <th className="py-3 px-4 text-left">Price</th>
                  <th className="py-3 px-4 text-left">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={it.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <input
                        value={it.name}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((p) =>
                              p.id === it.id ? { ...p, name: e.target.value } : p
                            )
                          )
                        }
                        className="w-full border rounded px-2 py-1 text-sm focus:ring focus:ring-blue-100"
                      />
                    </td>
                    <td className="py-3 px-4 w-24">
                      <input
                        type="number"
                        value={it.qty}
                        onChange={(e) => updateQty(it.id, Number(e.target.value))}
                        className="w-full border rounded px-2 py-1 text-sm focus:ring focus:ring-blue-100"
                      />
                    </td>
                    <td className="py-3 px-4 w-32">
                      <input
                        type="number"
                        value={it.price}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((p) =>
                              p.id === it.id
                                ? { ...p, price: Number(e.target.value) }
                                : p
                            )
                          )
                        }
                        className="w-full border rounded px-2 py-1 text-sm focus:ring focus:ring-blue-100"
                      />
                    </td>
                    <td className="py-3 px-4 font-semibold">
                      ₹{(it.qty * it.price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
            <div className="flex gap-3">
              <button
                onClick={() =>
                  setItems((prev) => [
                    ...prev,
                    { id: Date.now().toString(), name: "New Item", qty: 1, price: 0 },
                  ])
                }
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                + Add Item
              </button>
              <button
                onClick={() => setItems((prev) => prev.slice(0, -1))}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                - Remove Item
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDownloadPdf}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Download PDF
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Print
              </button>
            </div>
          </div>

          {/* Terms */}
          <p className="text-xs text-gray-500 mt-6">
            <strong>Return & Refund Policy:</strong> Products can be returned within
            7 days of delivery if damaged or defective. Refunds will be processed
            after quality check. For more details, visit our{" "}
            <Link href="/return-policy" className="text-blue-600 hover:underline">
              Return Policy
            </Link>{" "}
            page.
          </p>
        </div>
      </div>
    </main>
  );
}
