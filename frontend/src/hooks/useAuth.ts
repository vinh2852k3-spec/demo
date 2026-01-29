import { useCallback, useState } from "react";
import { axiosClient } from "../lib/axiosClient";
import type { AuthResult, PaymentDTO, User } from "../types/pi";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showSignIn, setShowSignIn] = useState(false);

  const onIncompletePaymentFound = useCallback(async (payment: PaymentDTO) => {
    await axiosClient.post("/payments/incomplete", { payment });
  }, []);

  const signInUser = useCallback(async (authResult: AuthResult) => {
    await axiosClient.post("/user/signin", { authResult });
    setUser(authResult.user);
    setShowSignIn(false);
  }, []);

  const signIn = useCallback(async () => {
    const scopes = ["username", "payments", "roles", "in_app_notifications"];

    const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);

    await signInUser(authResult);
  }, [onIncompletePaymentFound, signInUser]);

  const signOut = useCallback(async () => {
    await axiosClient.get("/user/signout");
    setUser(null);
  }, []);

  const closeSignIn = useCallback(() => {
    setShowSignIn(false);
  }, []);

  return {
    user,
    isAuthenticated: Boolean(user),
    showSignIn,
    signIn,
    signOut,
    closeSignIn,
    requireAuth: () => setShowSignIn(true),
  };
};
