
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react"; // Use Lucide React instead of Radix UI
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast"; // Updated import path
import { db } from '@/lib/supabase';

// Update the props interface to include onPaymentAdded
interface AddPaymentFormProps {
  clientId: number;
  onPaymentAdded: () => void;
}

const AddPaymentForm = ({ clientId, onPaymentAdded }: AddPaymentFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [serviceId, setServiceId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(undefined);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [status, setStatus] = useState<'pending' | 'paid' | 'overdue'>('pending');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesData = await db.services.getAll();
        setServices(servicesData);
      } catch (error) {
        console.error('Error fetching services:', error);
        toast({
          title: "Error",
          description: "Failed to load services.",
          variant: "destructive",
        });
      }
    };

    fetchServices();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Format dates to ISO strings for the database
      const paymentData = {
        client_id: clientId,
        service_id: parseInt(serviceId),
        amount: parseFloat(amount),
        payment_date: paymentDate ? paymentDate.toISOString() : '',
        due_date: dueDate ? dueDate.toISOString() : '',
        payment_method: paymentMethod,
        notes: notes || '',
        status: status,
      };
      
      await db.payments.create(paymentData);
      
      toast({
        title: "Sucesso",
        description: "Pagamento adicionado com sucesso!",
        variant: "default",
      });
      
      // Reset form fields
      setServiceId('');
      setAmount('');
      setPaymentDate(undefined);
      setDueDate(undefined);
      setPaymentMethod('');
      setStatus('pending');
      setNotes('');
      
      // Close modal and refresh data
      setIsOpen(false);
      
      // Call the onPaymentAdded callback to refresh the parent component
      onPaymentAdded();
      
    } catch (error) {
      console.error('Error adding payment:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar pagamento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="serviceId">Serviço</Label>
        <Select onValueChange={setServiceId} defaultValue={serviceId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione um serviço" />
          </SelectTrigger>
          <SelectContent>
            {services.map((service) => (
              <SelectItem key={service.id} value={String(service.id)}>
                {service.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="amount">Valor</Label>
        <Input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          required
        />
      </div>
      <div>
        <Label htmlFor="paymentDate">Data de Pagamento</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !paymentDate && "text-muted-foreground"
              )}
            >
              {paymentDate ? (
                format(paymentDate, "PPP")
              ) : (
                <span>Selecione a data</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center" side="bottom">
            <Calendar
              mode="single"
              selected={paymentDate}
              onSelect={setPaymentDate}
              disabled={(date) =>
                date > new Date()
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div>
        <Label htmlFor="dueDate">Data de Vencimento</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !dueDate && "text-muted-foreground"
              )}
            >
              {dueDate ? (
                format(dueDate, "PPP")
              ) : (
                <span>Selecione a data</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center" side="bottom">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={setDueDate}
              disabled={(date) =>
                date < new Date()
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div>
        <Label htmlFor="paymentMethod">Método de Pagamento</Label>
        <Input
          type="text"
          id="paymentMethod"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          placeholder="Dinheiro, Cartão, Transferência..."
          required
        />
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <Select 
          onValueChange={(value) => setStatus(value as 'pending' | 'paid' | 'overdue')}
          defaultValue={status}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="paid">Pago</SelectItem>
            <SelectItem value="overdue">Atrasado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="notes">Notas</Label>
        <Input
          type="text"
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observações adicionais..."
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Adicionando..." : "Adicionar Pagamento"}
      </Button>
    </form>
  );
};

export default AddPaymentForm;
