import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Chart from 'chart.js/auto';
import './styles.css';
import Login from './components/Login';

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ name: '', amount: '', date: '', category: 'Food' });
  const [darkMode, setDarkMode] = useState(false);
  const [charts, setCharts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    // Set authorization header
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    fetchExpenses();
  }, [navigate]);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/expenses');
      setExpenses(res.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addExpense = async () => {
    if (!form.name || !form.amount || !form.date) {
      alert('Please fill all fields');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/expenses', form);
      setForm({ name: '', amount: '', date: '', category: 'Food' });
      fetchExpenses();
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const deleteExpense = async id => {
    try {
      await axios.delete(`http://localhost:5000/api/expenses/${id}`);
      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  useEffect(() => {
    if (expenses.length > 0) {
      updateCharts();
    }
  }, [expenses, darkMode]);

  const updateCharts = () => {
    const categories = {};
    const dailyTotals = {};
    const monthlyTotals = {};

    expenses.forEach(exp => {
      categories[exp.category] = (categories[exp.category] || 0) + Number(exp.amount);
      dailyTotals[exp.date] = (dailyTotals[exp.date] || 0) + Number(exp.amount);
      const month = exp.date.slice(0, 7);
      monthlyTotals[month] = (monthlyTotals[month] || 0) + Number(exp.amount);
    });

    const textColor = darkMode ? "#ffffff" : "#212529";

    // Destroy existing charts
    Object.values(charts).forEach(chart => chart.destroy());

    // Create new charts
    const newCharts = {
      expenseChart: new Chart(document.getElementById("expenseChart"), {
        type: "doughnut",
        data: {
          labels: Object.keys(categories),
          datasets: [{
            data: Object.values(categories),
            backgroundColor: [
              "#00bcd4", "#8e44ad", "#f39c12", "#27ae60",
              "#e74c3c", "#3498db", "#2ecc71", "#f1c40f"
            ]
          }]
        },
        options: {
          plugins: {
            legend: { labels: { color: textColor } }
          }
        }
      }),

      dailyChart: new Chart(document.getElementById("dailyChart"), {
        type: "doughnut",
        data: {
          labels: Object.keys(dailyTotals),
          datasets: [{
            data: Object.values(dailyTotals),
            backgroundColor: [
              "#ff6b6b", "#6c5ce7", "#00cec9", "#fab1a0",
              "#e84393", "#81ecec", "#fdcb6e", "#0984e3"
            ]
          }]
        },
        options: {
          plugins: {
            legend: { labels: { color: textColor } }
          }
        }
      }),

      monthlyChart: new Chart(document.getElementById("monthlyChart"), {
        type: "doughnut",
        data: {
          labels: Object.keys(monthlyTotals),
          datasets: [{
            data: Object.values(monthlyTotals),
            backgroundColor: [
              "#1abc9c", "#c0392b", "#2c3e50", "#d35400",
              "#7f8c8d", "#34495e", "#9b59b6", "#16a085"
            ]
          }]
        },
        options: {
          plugins: {
            legend: { labels: { color: textColor } }
          }
        }
      }),

      barChart: new Chart(document.getElementById("barChart"), {
        type: "bar",
        data: {
          labels: Object.keys(monthlyTotals).sort(),
          datasets: [{
            label: 'Monthly Spending (₹)',
            data: Object.keys(monthlyTotals).sort().map(label => monthlyTotals[label]),
            backgroundColor: '#4dabf7',
            borderRadius: 5
          }]
        },
        options: {
          plugins: {
            legend: { labels: { color: textColor } }
          },
          scales: {
            x: { ticks: { color: textColor } },
            y: { ticks: { color: textColor } }
          }
        }
      })
    };

    setCharts(newCharts);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark-mode");
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/');
    window.location.reload();
  };

  const totalAmount = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  return (
    <div className={darkMode ? "dark-mode" : ""}>
      <div className="toggle-dark" onClick={toggleDarkMode}>
        {darkMode ? "☀️ Light Mode" : "🌓 Dark Mode"}
      </div>
      <button
        onClick={handleLogout}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          padding: '8px 16px',
          backgroundColor: '#ff6b6b',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Logout
      </button>
      <div className="container">
        <h2 className="text-center">Expense Tracker</h2>

        <div className="mb-3">
          <input
            name="name"
            className="form-control"
            placeholder="Expense Name"
            value={form.name}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <input
            name="amount"
            type="number"
            className="form-control"
            placeholder="Amount"
            value={form.amount}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <input
            name="date"
            type="date"
            className="form-control"
            value={form.date}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <select
            name="category"
            className="form-select"
            value={form.category}
            onChange={handleChange}
          >
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Shopping">Shopping</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Health">Health</option>
            <option value="Education">Education</option>
            <option value="Bills">Bills</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <button className="btn btn-success w-100" onClick={addExpense}>
          Add Expense
        </button>

        <h3 className="mt-4">Expenses</h3>
        <ul className="list-group">
          {expenses.map(expense => (
            <li key={expense._id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <strong>{expense.name}</strong> - ₹{expense.amount} ({expense.category})<br />
                <small>{expense.date}</small>
              </div>
              <button className="delete-btn" onClick={() => deleteExpense(expense._id)}>X</button>
            </li>
          ))}
        </ul>

        <h3 className="mt-4">Total Spending: ₹{totalAmount.toFixed(2)}</h3>

        <h3 className="mt-4">Expense Overview</h3>
        <div className="chart-section">
          <div className="chart-container">
            <h4>Spending Over Time</h4>
            <canvas id="barChart"></canvas>
          </div>
          <div className="chart-container">
            <h4>By Category</h4>
            <canvas id="expenseChart"></canvas>
          </div>
          <div className="chart-container">
            <h4>Daily Expense</h4>
            <canvas id="dailyChart"></canvas>
          </div>
          <div className="chart-container">
            <h4>Monthly Expense</h4>
            <canvas id="monthlyChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            isAuthenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <Login setIsAuthenticated={setIsAuthenticated} />
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? 
              <Dashboard /> : 
              <Navigate to="/" replace />
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;