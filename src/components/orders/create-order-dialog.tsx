"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { orderSchema, CreateOrderInput, Order } from "./types";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function CreateOrderDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateOrderInput>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      orderNumber: 0,
      customerName: "",
      orderDate: new Date(),
      status: "Pending",
      total: 0,
    },
  });

  const createOrderMutation = useMutation<Order, Error, CreateOrderInput, unknown>({
    mutationFn: async (newOrder: CreateOrderInput) => {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder),
      });
      if (!res.ok) throw new Error("Failed to create order");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Order created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      reset();
      setOpen(false);
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateOrderInput) => {
    createOrderMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Order</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label>Order Number</label>
            <input type="number" {...register("orderNumber")} />
            {errors.orderNumber && <p>{errors.orderNumber.message}</p>}
          </div>
          <div>
            <label>Customer Name</label>
            <input type="text" {...register("customerName")} />
            {errors.customerName && <p>{errors.customerName.message}</p>}
          </div>
          <div>
            <label>Order Date</label>
            <input type="date" {...register("orderDate", { valueAsDate: true })} />
            {errors.orderDate && <p>{errors.orderDate.message}</p>}
          </div>
          <div>
            <label>Status</label>
            <input type="text" {...register("status")} />
            {errors.status && <p>{errors.status.message}</p>}
          </div>
          <div>
            <label>Total</label>
            <input type="number" step="0.01" {...register("total", { valueAsNumber: true })} />
            {errors.total && <p>{errors.total.message}</p>}
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createOrderMutation.status === "pending"}>
              {createOrderMutation.status === "pending" ? "Creating..." : "Create Order"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 