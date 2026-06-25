import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

const GENRE_COLORS = {
  Fiction: { bg: '#ede9fe', color: '#7c3aed', icon: '📖' },
  Technology: { bg: '#dbeafe', color: '#1d4ed8', icon: '💻' },
  Fantasy: { bg: '#fce7f3', color: '#be185d', icon: '🧙' },
  'Self-help': { bg: '#dcfce7', color: '#15803d', icon: '🌱' },
  Science: { bg: '#ffedd5', color: '#c2410c', icon: '🔬' },
  History: { bg: '#f1f5f9', color: '#475569', icon: '🏛️' },
  Default: { bg: '#f3f4f6', color: '#374151', icon: '📚' },
};

function getGenreStyle(genre) {
  return GENRE_COLORS[genre] || GENRE_COLORS['Default'];
}

function StatCard({ icon, label, value, color, trend }) {
  return (
    <div className="stat-card" style={{ borderTop: `3px solid ${color}` }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-value" style={{ color }}>{value}</div>
      <div className="stat-label">{label}</div>
      {trend && (
        <div className={`stat-trend ${trend.type}`}>
          {trend.type === 'up' ? '↑' : '•'} {trend.text}
        </div>
      )}
    </div>
  );
}

function Dashboard({ user, onLogout }) {
  const [profileMemberId, setProfileMemberId] = useState('');
  const [memberProfile, setMemberProfile] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showPopup, setShowPopup] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 8;
  const [history, setHistory] = useState([]);
  const [historyChecked, setHistoryChecked] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [overdueBooks, setOverdueBooks] = useState([]);
  const [bookDetail, setBookDetail] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState(null);
  const [bookId, setBookId] = useState('');
  const [memberId, setMemberId] = useState('');
  const [recordId, setRecordId] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [fineMemberId, setFineMemberId] = useState('');
  const [fines, setFines] = useState([]);
  const [finesChecked, setFinesChecked] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newGenre, setNewGenre] = useState('');
  const [newCopies, setNewCopies] = useState('');
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberPhone, setMemberPhone] = useState('');

  const isAdmin = user?.role === 'admin';

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(books.length / booksPerPage);

  useEffect(() => {
    fetchBooks();
    fetchStats();
    fetchOverdue();
  }, []);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchBooks = async (search = '') => {
    try {
      const res = await axios.get(`${API_URL}/books`, {
        params: search ? { search } : {},
      });
      setBooks(res.data);
    } catch (err) {
      console.error('Error fetching books:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/stats`);
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchBookDetail = async (bookId) => {
    try {
      const res = await axios.get(`${API_URL}/books/${bookId}`);
      setBookDetail(res.data);
      setSelectedBook(bookId);
    } catch (err) {
      console.error('Error fetching book detail:', err);
    }
  };

  const handleQuickBorrow = async (e, bookId) => {
    e.stopPropagation();
    const memberIdToUse = prompt('Enter your Member ID to borrow this book:');
    if (!memberIdToUse) return;
    try {
      const res = await axios.post(`${API_URL}/borrow`, {
        book_id: bookId,
        member_id: Number(memberIdToUse),
      });
      showMessage(`${res.data.message} — Record ID: ${res.data.record_id}`);
      fetchBooks();
      fetchStats();
    } catch (err) {
      showMessage(err.response?.data?.error || 'Something went wrong', true);
    }
  };

  const fetchOverdue = async () => {
    try {
      const res = await axios.get(`${API_URL}/overdue`);
      setOverdueBooks(res.data);
    } catch (err) {
      console.error('Error fetching overdue:', err);
    }
  };

  const handleCheckHistory = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get(`${API_URL}/history/${fineMemberId}`);
      setHistory(res.data);
      setHistoryChecked(true);
    } catch (err) {
      showMessage(err.response?.data?.error || 'Something went wrong', true);
    }
  };

  const handleViewProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get(`${API_URL}/members/${profileMemberId}`);
      setMemberProfile(res.data);
      setShowProfile(true);
    } catch (err) {
      showMessage(err.response?.data?.error || 'Member not found', true);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
    fetchBooks(value);
  };

  const showMessage = (text, error = false) => {
    setMessage(text);
    setIsError(error);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleBorrow = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/borrow`, {
        book_id: Number(bookId),
        member_id: Number(memberId),
      });
      showMessage(`${res.data.message} — Record ID: ${res.data.record_id}`);
      fetchBooks();
      fetchStats();
    } catch (err) {
      showMessage(err.response?.data?.error || 'Something went wrong', true);
    }
  };

  const handleReturn = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${API_URL}/return`, {
        record_id: Number(recordId),
      });
      showMessage(res.data.message);
      fetchBooks();
      fetchStats();
    } catch (err) {
      showMessage(err.response?.data?.error || 'Something went wrong', true);
    }
  };

  const handleCheckFines = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get(`${API_URL}/fines/${fineMemberId}`);
      setFines(res.data);
      setFinesChecked(true);
    } catch (err) {
      showMessage(err.response?.data?.error || 'Something went wrong', true);
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${API_URL}/books`,
        { title: newTitle, author: newAuthor, genre: newGenre, total_copies: Number(newCopies) },
        getAuthHeader()
      );
      showMessage(res.data.message);
      setNewTitle(''); setNewAuthor(''); setNewGenre(''); setNewCopies('');
      fetchBooks();
      fetchStats();
    } catch (err) {
      showMessage(err.response?.data?.error || 'Something went wrong', true);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${API_URL}/members`,
        { name: memberName, email: memberEmail, phone: memberPhone },
        getAuthHeader()
      );
      showMessage(res.data.message);
      setMemberName(''); setMemberEmail(''); setMemberPhone('');
      fetchStats();
    } catch (err) {
      showMessage(err.response?.data?.error || 'Something went wrong', true);
    }
  };

  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className={`dashboard ${darkMode ? 'dark' : ''}`}>

      {/* WELCOME POPUP */}
      {showPopup && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup-card" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={() => setShowPopup(false)}>✕</button>
            <div className="popup-header">
              <h2>📚 Welcome to LibraryMS</h2>
              <p>What are you looking for today?</p>
            </div>
            <div className="popup-grid">
              <div className="popup-item" onClick={() => setShowPopup(false)}>
                <span className="popup-icon">📖</span>
                <span>Browse Books</span>
              </div>
              <div className="popup-item" onClick={() => setShowPopup(false)}>
                <span className="popup-icon">📤</span>
                <span>Borrow a Book</span>
              </div>
              <div className="popup-item" onClick={() => setShowPopup(false)}>
                <span className="popup-icon">📥</span>
                <span>Return a Book</span>
              </div>
              <div className="popup-item" onClick={() => setShowPopup(false)}>
                <span className="popup-icon">Fines</span>
                <span>Check Fines</span>
              </div>
              {isAdmin && (
                <div className="popup-item" onClick={() => setShowPopup(false)}>
                  <span className="popup-icon">🔒</span>
                  <span>Manage Books</span>
                </div>
              )}
              {isAdmin && (
                <div className="popup-item" onClick={() => setShowPopup(false)}>
                  <span className="popup-icon">👥</span>
                  <span>Manage Members</span>
                </div>
              )}
            </div>
            <button className="popup-skip" onClick={() => setShowPopup(false)}>
              Skip & Go to Dashboard →
            </button>
          </div>
        </div>
      )}

      {/* BOOK DETAIL MODAL */}
      {selectedBook && bookDetail && (
        <div className="popup-overlay" onClick={() => setSelectedBook(null)}>
          <div className="popup-card book-modal" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={() => setSelectedBook(null)}>✕</button>
            <div className="book-modal-header" style={{ background: getGenreStyle(bookDetail.genre).bg }}>
              <span className="book-modal-icon">{getGenreStyle(bookDetail.genre).icon}</span>
              <div>
                <h2>{bookDetail.title}</h2>
                <p>{bookDetail.author}</p>
                <span className="genre-tag" style={{
                  background: getGenreStyle(bookDetail.genre).bg,
                  color: getGenreStyle(bookDetail.genre).color,
                  border: `1px solid ${getGenreStyle(bookDetail.genre).color}`
                }}>
                  {bookDetail.genre || 'General'}
                </span>
              </div>
            </div>
            <div className="book-modal-stats">
              <div className="book-modal-stat">
                <span className="book-modal-stat-value">{bookDetail.total_copies}</span>
                <span className="book-modal-stat-label">Total Copies</span>
              </div>
              <div className="book-modal-stat">
                <span className="book-modal-stat-value" style={{ color: '#047857' }}>{bookDetail.available_copies}</span>
                <span className="book-modal-stat-label">Available</span>
              </div>
              <div className="book-modal-stat">
                <span className="book-modal-stat-value" style={{ color: '#d97706' }}>{bookDetail.currently_borrowed}</span>
                <span className="book-modal-stat-label">Borrowed Now</span>
              </div>
              <div className="book-modal-stat">
                <span className="book-modal-stat-value" style={{ color: '#4f46e5' }}>{bookDetail.total_borrows}</span>
                <span className="book-modal-stat-label">Total Borrows</span>
              </div>
            </div>
            <div className="book-modal-footer">
              <p>Book ID: <strong>{bookDetail.book_id}</strong></p>
              <span className={`availability ${bookDetail.available_copies > 0 ? 'in-stock' : 'out-of-stock'}`}>
                {bookDetail.available_copies > 0 ? '✅ Available to Borrow' : '❌ Currently Unavailable'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MEMBER PROFILE MODAL */}
      {showProfile && memberProfile && (
        <div className="popup-overlay" onClick={() => setShowProfile(false)}>
          <div className="popup-card profile-modal" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={() => setShowProfile(false)}>✕</button>
            <div className="profile-header">
              <div className="profile-avatar">
                {memberProfile.member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div>
                <h2>{memberProfile.member.name}</h2>
                <p>{memberProfile.member.email}</p>
                {memberProfile.member.phone && <p>📞 {memberProfile.member.phone}</p>}
              </div>
            </div>

            <div className="profile-stats">
              <div className="profile-stat">
                <span className="profile-stat-value">{memberProfile.totalBorrows}</span>
                <span className="profile-stat-label">Total Borrows</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value" style={{ color: '#d97706' }}>{memberProfile.currentlyBorrowed}</span>
                <span className="profile-stat-label">Active</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value" style={{ color: '#dc2626' }}>₹{memberProfile.unpaidFines}</span>
                <span className="profile-stat-label">Unpaid Fines</span>
              </div>
            </div>

            <div className="profile-history">
              <h3>Borrowing History</h3>
              {memberProfile.history.length === 0 ? (
                <p className="no-fines">No borrowing history yet</p>
              ) : (
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Book</th>
                      <th>Borrowed</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberProfile.history.map((h) => (
                      <tr key={h.record_id}>
                        <td>{h.book_title}</td>
                        <td>{new Date(h.borrow_date).toLocaleDateString()}</td>
                        <td><span className={`status-pill ${h.status.toLowerCase()}`}>{h.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="navbar-brand">📚 LibraryMS</div>
        <div className="navbar-links">
          <button className="nav-link" onClick={() => scrollToId('dashboard-top')}>Dashboard</button>
          <button className="nav-link" onClick={() => scrollToId('books-section')}>Books</button>
          <button className="nav-link" onClick={() => scrollToId('members-section')}>Members</button>
          <button className="nav-link" onClick={() => scrollToId('transactions-section')}>Transactions</button>
          {isAdmin && (
            <button className="nav-link" onClick={() => scrollToId('admin-section')}>Admin</button>
          )}
        </div>
        <div className="navbar-user">
          <button className="dark-mode-btn" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? '☀️' : '🌙'}
          </button>
          <span className={`role-badge ${isAdmin ? 'admin' : 'member'}`}>
            {isAdmin ? '🔑 Admin' : '👤 Member'}
          </span>
          <div className="avatar">{initials}</div>
          <span className="user-name">{user?.name}</span>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </nav>

      <div className="app" id="dashboard-top">
        {message && (
          <div className={`message ${isError ? 'error' : ''}`}>{message}</div>
        )}

        {/* OVERDUE ALERT */}
        {overdueBooks.length > 0 && (
          <div className="overdue-alert">
            <div className="overdue-alert-header">
              ⚠️ <strong>{overdueBooks.length} Overdue Book{overdueBooks.length > 1 ? 's' : ''}</strong> — Immediate attention required!
            </div>
            <div className="overdue-list">
              {overdueBooks.map((item) => (
                <div className="overdue-item" key={item.record_id}>
                  <span>📚 <strong>{item.book_title}</strong> borrowed by <strong>{item.member_name}</strong></span>
                  <span className="overdue-days">{item.days_overdue} day{item.days_overdue > 1 ? 's' : ''} overdue</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STATS */}
        {stats && (
          <div className="stats-grid">
            <StatCard
              icon="📚"
              label="Total Books"
              value={stats.totalBooks}
              color="#4f46e5"
              trend={{ type: 'neutral', text: 'In collection' }}
            />
            <StatCard
              icon="👥"
              label="Total Members"
              value={stats.totalMembers}
              color="#0891b2"
              trend={{ type: 'neutral', text: 'Registered' }}
            />
            <StatCard
              icon="📤"
              label="Currently Borrowed"
              value={stats.currentlyBorrowed}
              color="#d97706"
              trend={{
                type: stats.currentlyBorrowed > 0 ? 'up' : 'neutral',
                text: 'Active loans',
              }}
            />
            <StatCard
              icon="💰"
              label="Unpaid Fines"
              value={stats.unpaidFines}
              color="#dc2626"
              trend={{
                type: stats.unpaidFines > 0 ? 'up' : 'neutral',
                text: stats.unpaidFines > 0 ? 'Needs attention' : 'All clear',
              }}
            />
          </div>
        )}

        {/* BOOKS */}
        <section id="books-section">
          <div className="section-header-row">
            <div className="section-title">Available Books</div>
            <input
              type="text"
              className="search-bar"
              placeholder="Search by title, author, or genre..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          <div className="book-list">
            {currentBooks.map((book) => {
              const style = getGenreStyle(book.genre);
              return (
                <div className="book-card" key={book.book_id} onClick={() => fetchBookDetail(book.book_id)} style={{ cursor: 'pointer' }}>
                  <div className="book-icon-wrap" style={{ background: style.bg }}>
                    <span className="book-icon">{style.icon}</span>
                  </div>
                  <div className="book-info">
                    <h3>{book.title}</h3>
                    <div className="meta">{book.author}</div>
                    <span className="genre-tag" style={{ background: style.bg, color: style.color }}>
                      {book.genre || 'General'}
                    </span>
                    <div className="book-footer">
                      <span className="book-id">ID: {book.book_id}</span>
                      <span className={`availability ${book.available_copies > 0 ? 'in-stock' : 'out-of-stock'}`}>
                        {book.available_copies}/{book.total_copies} available
                      </span>
                    </div>
                    {book.available_copies > 0 && (
                      <button
                        className="quick-borrow-btn"
                        onClick={(e) => handleQuickBorrow(e, book.book_id)}
                      >
                        Borrow Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={currentPage === page ? 'active' : ''}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </section>

        {/* FORMS */}
        <div className="forms-row" id="transactions-section">
          <section className="form-card">
            <h2>📤 Borrow a Book</h2>
            <form onSubmit={handleBorrow}>
              <input type="number" placeholder="Book ID" value={bookId} onChange={(e) => setBookId(e.target.value)} required />
              <input type="number" placeholder="Member ID" value={memberId} onChange={(e) => setMemberId(e.target.value)} required />
              <button type="submit">Borrow</button>
            </form>
          </section>

          <section className="form-card" id="members-section">
            <h2>👤 Member Profile</h2>
            <form onSubmit={handleViewProfile}>
              <input type="number" placeholder="Member ID" value={profileMemberId} onChange={(e) => setProfileMemberId(e.target.value)} required />
              <button type="submit">View Profile</button>
            </form>
          </section>

          <section className="form-card">
            <h2>📥 Return a Book</h2>
            <form onSubmit={handleReturn}>
              <input type="number" placeholder="Record ID" value={recordId} onChange={(e) => setRecordId(e.target.value)} required />
              <button type="submit">Return</button>
            </form>
          </section>

          <section className="form-card">
            <h2>💰 Check Fines & History</h2>
            <form onSubmit={handleCheckFines}>
              <input type="number" placeholder="Member ID" value={fineMemberId} onChange={(e) => setFineMemberId(e.target.value)} required />
              <div className="btn-row">
                <button type="submit">Check Fines</button>
                <button type="button" onClick={handleCheckHistory}>View History</button>
              </div>
            </form>
            {finesChecked && (
              <div className="fines-result">
                {fines.length === 0 ? (
                  <p className="no-fines">✅ No fines for this member</p>
                ) : (
                  <ul>
                    {fines.map((fine) => (
                      <li key={fine.fine_id}>
                        <span>{fine.title}</span>
                        <strong>₹{fine.fine_amount} {fine.paid ? '(Paid)' : '(Unpaid)'}</strong>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {historyChecked && (
              <div className="history-result">
                {history.length === 0 ? (
                  <p className="no-fines">No borrowing history yet</p>
                ) : (
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Book</th>
                        <th>Borrowed</th>
                        <th>Due</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((h) => (
                        <tr key={h.record_id}>
                          <td>{h.book_title}</td>
                          <td>{new Date(h.borrow_date).toLocaleDateString()}</td>
                          <td>{new Date(h.due_date).toLocaleDateString()}</td>
                          <td>
                            <span className={`status-pill ${h.status.toLowerCase()}`}>{h.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </section>

          {isAdmin && (
            <section className="form-card admin-card" id="admin-section">
              <h2>🔒 Add a New Book</h2>
              <form onSubmit={handleAddBook}>
                <input type="text" placeholder="Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
                <input type="text" placeholder="Author" value={newAuthor} onChange={(e) => setNewAuthor(e.target.value)} required />
                <input type="text" placeholder="Genre" value={newGenre} onChange={(e) => setNewGenre(e.target.value)} />
                <input type="number" placeholder="Total Copies" value={newCopies} onChange={(e) => setNewCopies(e.target.value)} required />
                <button type="submit">Add Book</button>
              </form>
            </section>
          )}

          {isAdmin && (
            <section className="form-card admin-card">
              <h2>🔒 Add a New Member</h2>
              <form onSubmit={handleAddMember}>
                <input type="text" placeholder="Full Name" value={memberName} onChange={(e) => setMemberName(e.target.value)} required />
                <input type="email" placeholder="Email" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} required />
                <input type="text" placeholder="Phone" value={memberPhone} onChange={(e) => setMemberPhone(e.target.value)} />
                <button type="submit">Add Member</button>
              </form>
            </section>
          )}
        </div>

        {/* RECENT ACTIVITY PANEL — fills empty space before footer */}
        <section className="recent-activity-section">
          <div className="section-title">Recent Activity</div>
          <div className="activity-grid">
            <div className="activity-card">
              <div className="activity-card-header">
                <span className="activity-icon">📖</span>
                <h4>Library Snapshot</h4>
              </div>
              <ul className="activity-list">
                <li>
                  <span>Total catalog size</span>
                  <strong>{stats ? stats.totalBooks : '—'} titles</strong>
                </li>
                <li>
                  <span>Registered members</span>
                  <strong>{stats ? stats.totalMembers : '—'}</strong>
                </li>
                <li>
                  <span>Books currently out</span>
                  <strong>{stats ? stats.currentlyBorrowed : '—'}</strong>
                </li>
                <li>
                  <span>Unpaid fines</span>
                  <strong>₹{stats ? stats.unpaidFines : '—'}</strong>
                </li>
              </ul>
            </div>

            <div className="activity-card">
              <div className="activity-card-header">
                <span className="activity-icon">⚠️</span>
                <h4>Overdue Watchlist</h4>
              </div>
              {overdueBooks.length === 0 ? (
                <p className="no-fines">No overdue books right now</p>
              ) : (
                <ul className="activity-list">
                  {overdueBooks.slice(0, 4).map((item) => (
                    <li key={item.record_id}>
                      <span>{item.book_title}</span>
                      <strong className="overdue-text">{item.days_overdue}d overdue</strong>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="activity-card">
              <div className="activity-card-header">
                <span className="activity-icon">💡</span>
                <h4>Quick Tips</h4>
              </div>
              <ul className="activity-list tips-list">
                <li>Click any book card to see detailed stats</li>
                <li>Use the search bar to filter by genre or author</li>
                <li>Check a member's profile to see their full history</li>
                {isAdmin && <li>Use the Admin section to add books or members</li>}
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-col">
            <h4>📚 LibraryMS</h4>
            <p>A modern library management system for seamless book borrowing, returns, and member management.</p>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li>Browse Books</li>
              <li>Borrow a Book</li>
              <li>Return a Book</li>
              <li>Check Fines</li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Information</h4>
            <ul>
              <li>About Us</li>
              <li>Privacy Policy</li>
              <li>Terms & Conditions</li>
              <li>Contact Us</li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li>📧 library@example.com</li>
              <li>📞 +91-9685239330</li>
              <li>📍 Bhopal, Madhya Pradesh</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 LibraryMS. All rights reserved. | Designed & Developed by Aakash Wadhwani</p>
        </div>
      </footer>

    </div>
  );
}

export default Dashboard;
