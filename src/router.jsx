import { createBrowserRouter } from 'react-router-dom';
import Admin from './pages/Admin';
import Blessing from './pages/Blessing';

const router = createBrowserRouter([
  {
    path: '/admin',
    element: <Admin />,
  },
  {
    path: '/blessing/:id',
    element: <Blessing />,
  },
]);

export default router;