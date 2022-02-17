import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Spinner from "react-bootstrap/Spinner";
import { AuthProvider } from "./context/FirebaseAuthContext";

const SigninView = lazy(() => import("./views/SigninView"));
const SignupView = lazy(() => import("./views/SignupView"));
const DashboardView = lazy(() => import("./views/DashboardView"));
const CheckoutView = lazy(() => import("./views/CheckoutView"));

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/">
            <Route
              index
              element={
                <Suspense fallback={<Loading />}>
                  <SigninView />
                </Suspense>
              }
            />
            <Route
              path="/signin"
              element={
                <Suspense fallback={<Loading />}>
                  <SigninView />
                </Suspense>
              }
            />
            <Route
              path="/signup"
              element={
                <Suspense fallback={<Loading />}>
                  <SignupView />
                </Suspense>
              }
            />
            <Route
              path="/dashboard"
              element={
                <Suspense fallback={<Loading />}>
                  <DashboardView />
                </Suspense>
              }
            />
            <Route
              path="/checkout"
              element={
                <Suspense fallback={<Loading />}>
                  <CheckoutView />
                </Suspense>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
};

const Loading = () => {
  return (
    <div className="App">
      <Spinner animation="border" />
    </div>
  );
};

export default App;
