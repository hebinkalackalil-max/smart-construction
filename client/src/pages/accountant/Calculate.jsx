import { useState, useEffect } from 'react';
import api from '../../utils/api';

const Calculate = () => {
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dailyRate, setDailyRate] = useState('');
  const [overtimeRate, setOvertimeRate] = useState('');
  const [loading, setLoading] = useState(false);
  const [calculatedData, setCalculatedData] = useState(null);
  const [workerSearch, setWorkerSearch] = useState('');

  useEffect(() => {
    fetchWorkers();
    // Set default date range (current month)
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  }, []);

  const fetchWorkers = async () => {
    try {
      const response = await api.get('/users');
      const allWorkers = response.data.data.filter(u => u.role === 'worker');
      setWorkers(allWorkers);
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
  };

  const handleCalculate = async () => {
    if (!selectedWorker || !startDate || !endDate || !dailyRate) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/payments', {
        workerID: selectedWorker,
        startDate,
        endDate,
        dailyRate: parseFloat(dailyRate),
        overtimeRate: overtimeRate ? parseFloat(overtimeRate) : undefined
      });
      
      setCalculatedData(response.data.data);
      alert('Payment calculated and generated successfully!');
      
      // Reset form
      setSelectedWorker('');
      setDailyRate('');
      setOvertimeRate('');
    } catch (error) {
      alert(error.response?.data?.message || 'Error calculating payment');
    } finally {
      setLoading(false);
    }
  };

  // Filter workers based on search
  const filteredWorkers = workers.filter(worker =>
    worker.name.toLowerCase().includes(workerSearch.toLowerCase()) ||
    worker.email.toLowerCase().includes(workerSearch.toLowerCase())
  );

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    boxSizing: 'border-box',
    marginBottom: '1rem'
  };

  const cardStyle = {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '1.5rem'
  };

  return (
    <div className="app-container">
      <h1 className="mb-4" style={{ color: 'var(--primary)' }}>Calculate Salary</h1>

      <div className="card p-3 mb-3">
        <h5 style={{ color: 'var(--primary)' }}>Generate Payment</h5>
        <form onSubmit={(e) => { e.preventDefault(); handleCalculate(); }} className="row g-3 mt-2">
          <div className="col-12 col-md-6">
            <label className="form-label">Select Worker *</label>
            {workers.length > 5 && <input type="text" className="form-control mb-2" placeholder="Search worker by name or email..." value={workerSearch} onChange={(e) => setWorkerSearch(e.target.value)} />}
            <select value={selectedWorker} onChange={(e) => setSelectedWorker(e.target.value)} required className="form-select">
              <option key="worker-empty" value="">Select Worker</option>
              {filteredWorkers.map((worker) => (
                <option key={worker._id || worker.id} value={worker._id || worker.id}>
                  {worker.name} ({worker.email})
                </option>
              ))}
            </select>
            {filteredWorkers.length === 0 && workerSearch && <div className="text-danger small mt-1">No workers found matching "{workerSearch}"</div>}
          </div>

          <div className="col-12 col-md-3">
            <label className="form-label">Start Date *</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="form-control" />
          </div>

          <div className="col-12 col-md-3">
            <label className="form-label">End Date *</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required className="form-control" />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label">Daily Rate (₹) *</label>
            <input type="number" value={dailyRate} onChange={(e) => setDailyRate(e.target.value)} required min="0" step="0.01" className="form-control" placeholder="Enter daily rate" />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label">Overtime Rate per Hour (₹) (Optional)</label>
            <input type="number" value={overtimeRate} onChange={(e) => setOvertimeRate(e.target.value)} min="0" step="0.01" className="form-control" placeholder="Leave blank to use default (dailyRate/8)" />
            <div className="small muted-small mt-1">If not specified, overtime rate will be calculated as dailyRate ÷ 8</div>
          </div>

          <div className="col-12 text-end">
            <button type="submit" className="btn btn-success" disabled={loading}>{loading ? 'Calculating...' : 'Calculate & Generate Payment'}</button>
          </div>
        </form>
      </div>

      {calculatedData && (
        <div className="card p-3">
          <h5 style={{ color: 'var(--primary)' }}>Payment Generated</h5>
          <div className="p-3 bg-light rounded mt-2 border border-2 border-success">
            <div className="row g-3 mb-2">
              <div className="col-12 col-md-3">
                <div className="muted-small">Worker</div>
                <div className="fw-semibold">{calculatedData.workerID?.name || 'N/A'}</div>
              </div>
              <div className="col-12 col-md-3">
                <div className="muted-small">Total Days</div>
                <div className="fw-semibold">{calculatedData.totalDays} days</div>
              </div>
              <div className="col-12 col-md-3">
                <div className="muted-small">Overtime Hours</div>
                <div className="fw-semibold">{calculatedData.overtimeHours || 0} hrs</div>
              </div>
              <div className="col-12 col-md-3">
                <div className="muted-small">Salary Amount</div>
                <div className="fw-bold text-success">₹{calculatedData.salaryAmount?.toLocaleString() || 0}</div>
              </div>
            </div>
            <div className="alert alert-warning mt-2 mb-0"><strong>Status:</strong> {calculatedData.paymentStatus} - Payment is pending approval</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calculate;

