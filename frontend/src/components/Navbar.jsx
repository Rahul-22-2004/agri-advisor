import { Link } from 'react-router-dom';

const Navbar = () => (
  <nav className="bg-green-600 text-white p-4">
    <ul className="flex space-x-4">
      <li><Link to="/">Profile</Link></li>
      <li><Link to="/advice">Advice</Link></li>
      <li><Link to="/weather">Weather</Link></li>
      <li><Link to="/prices">Prices</Link></li>
      <li><Link to="/identify">Identify</Link></li>
      <li><Link to="/history">History</Link></li>
    </ul>
  </nav>
);

export default Navbar;