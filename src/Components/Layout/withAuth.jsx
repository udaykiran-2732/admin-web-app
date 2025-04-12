"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { isLogin, translate } from "@/utils/helper";
import Loader from "../Loader/Loader";
import Swal from "sweetalert2";
import { store } from "@/store/store";

const withAuth = (WrappedComponent) => {
  const Wrapper = (props) => {
    const router = useRouter();
    const isLoggedIn = isLogin();

    const userData = store.getState()?.user?.data;
    const hasSubscription = store.getState().Settings?.data?.subscription;
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
      const privateRoutes = [
        "/user/advertisement",
        "/user/chat",
        "/user/dashboard",
        "/user/profile",
        "/user/edit-property",
        "/user/edit-project",
        "/user/favorites-properties",
        "/user/personalize-feed",
        "/user/subscription",
        "/user/notifications",
        "/user/transaction-history",
        "/user/interested",
        "/user/projects",
        "/user/verification-form",
        "/my-property",
        "/user-register",
      ];

      const subscriptionRoutes = ["/user/properties", "/user/add-project"];

      const isPrivateRoute = privateRoutes.includes(router.pathname);
      const isSubscriptionRoute = subscriptionRoutes.includes(router.pathname);

      if (isPrivateRoute && !isLoggedIn) {
        router.push("/");
      } else if (isSubscriptionRoute && !hasSubscription) {
        Swal.fire({
          icon: "error",
          title: translate("opps"),
          text: translate("youHaveNotSubscribe"),
          allowOutsideClick: false,
          customClass: {
            confirmButton: "Swal-confirm-buttons",
          },
        }).then((result) => {
          if (result.isConfirmed) {
            router.push("/subscription-plan"); // Redirect to the subscription page
          }
        });
      } else {
        setIsAuthorized(true);
      }

      setAuthChecked(true);
    }, [userData, router, hasSubscription]);

    if (!authChecked) {
      return <Loader />;
    }

    return isAuthorized ? <WrappedComponent {...props} /> : null;
  };

  return Wrapper;
};

export default withAuth;
