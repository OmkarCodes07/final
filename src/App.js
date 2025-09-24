import { useState, useEffect } from "react";
import axios from "axios";
import { Line, Bar } from "react-chartjs-2";
import jwtDecode from "jwt-decode";

function App() {
  const [campaigns, setCampaigns] = useState([]);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setRole(decoded.role);
    }
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    const res = await axios.get("http://localhost:5000/api/campaigns");
    setCampaigns(res.data);
  };

  const syncWithGoogleSheet = async () => {
    const res = await axios.get("http://localhost:5000/api/campaigns/sync");
    alert(res.data.msg);
    setCampaigns(res.data.campaigns);
  };

  const totalRevenue = campaigns.reduce((a, c) => a + c.revenue, 0);
  const totalSpend = campaigns.reduce((a, c) => a + c.spend, 0);
  const totalClicks = campaigns.reduce((a, c) => a + c.clicks, 0);
  const totalConversions = campaigns.reduce((a, c) => a + c.conversions, 0);
  const totalCustomers = campaigns.reduce((a, c) => a + c.customers, 0);

  const ROI = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend * 100).toFixed(2) : 0;
  const CAC = totalCustomers > 0 ? (totalSpend / totalCustomers).toFixed(2) : 0;
  const convRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : 0;

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">🚀 {role} Dashboard</h1>
        <button onClick={syncWithGoogleSheet} className="bg-gradient-to-r from-green-400 to-blue-500 px-4 py-2 rounded-xl shadow-md hover:scale-105 transition">
          🔄 Sync Google Sheet
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card title="Total Revenue" value={`₹${totalRevenue}`} />
        <Card title="Total Spend" value={`₹${totalSpend}`} />
        <Card title="ROI" value={`${ROI}%`} />
        <Card title="CAC" value={`₹${CAC}`} />
        <Card title="Conv. Rate" value={`${convRate}%`} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl mb-2">Revenue vs Spend</h2>
          <Line data={{
            labels: campaigns.map(c => new Date(c.startDate).toLocaleDateString()),
            datasets: [
              { label: "Revenue", data: campaigns.map(c => c.revenue), borderColor: "lime", fill: false },
              { label: "Spend", data: campaigns.map(c => c.spend), borderColor: "red", fill: false }
            ]
          }} />
        </div>
        <div className="card">
          <h2 className="text-xl mb-2">Conversion Rate Trend</h2>
          <Bar data={{
            labels: campaigns.map(c => new Date(c.startDate).toLocaleDateString()),
            datasets: [{ label: "Conv. Rate (%)", data: campaigns.map(c => (c.clicks > 0 ? (c.conversions / c.clicks) * 100 : 0)), backgroundColor: "cyan" }]
          }} />
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="card text-center">
      <h2 className="text-lg">{title}</h2>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}

export default App;
