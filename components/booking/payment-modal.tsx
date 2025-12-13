"use client";

import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  email: string;
  onSuccess: (reference: string) => void;
  onError?: (error: Error) => void;
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (options: {
        key: string;
        email: string;
        amount: number;
        currency?: string;
        ref: string;
        onClose: () => void;
        callback: (response: { reference: string }) => void;
        metadata?: Record<string, any>;
      }) => {
        openIframe: () => void;
      };
    };
  }
}

export function PaymentModal({
  isOpen,
  onClose,
  amount,
  email,
  onSuccess,
  onError,
}: PaymentModalProps) {
  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [isOpen]);

  const handlePayment = () => {
    if (typeof window === "undefined" || !window.PaystackPop) {
      onError?.(new Error("Paystack script not loaded"));
      return;
    }

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";
    const reference = `ref_${new Date().getTime()}`;

    const handler = window.PaystackPop.setup({
      key: publicKey,
      email,
      amount: amount * 100, // Paystack expects amount in kobo
      currency: "NGN",
      ref: reference,
      onClose: () => {
        onClose();
      },
      callback: (response) => {
        onSuccess(response.reference);
      },
    });

    handler.openIframe();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Complete Payment</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            You will be redirected to Paystack to complete your payment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-[#f9fafb] rounded-md">
            <span className="text-sm text-[#6b7280]">Total Amount</span>
            <span className="text-2xl font-semibold">
              ₦{amount.toLocaleString()}
            </span>
          </div>
          <Button onClick={handlePayment} className="w-full">
            Pay with Paystack
          </Button>
          <Button variant="outline" onClick={onClose} className="w-full">
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
