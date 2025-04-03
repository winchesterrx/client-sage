
import React, { useState, useEffect } from 'react';
import { Service } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { paymentsDb } from '@/lib/supabase/database/payments';
import { servicesDb } from '@/lib/supabase/database/services';
import { toast } from 'sonner';
import { PlusCircle } from 'lucide-react';

interface AddPaymentFormProps {
  clientId: number;
  onPaymentAdded: () => void;
}

const AddPaymentForm: React.FC<AddPaymentFormProps> = ({ clientId, onPaymentAdded }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    service_id: '',
    amount: '',
    due_date: new Date().toISOString().split('T')[0],
    payment_method: 'Transferência',
    notes: ''
  });

  useEffect(() => {
    const loadServices = async () => {
      const clientServices = await servicesDb.getByClient(clientId);
      setServices(clientServices);
    };

    loadServices();
  }, [clientId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleServiceChange = (value: string) => {
    setFormData(prev => ({ ...prev, service_id: value }));
    
    // Preencher o valor do pagamento com o preço do serviço selecionado
    const selectedService = services.find(s => s.id === parseInt(value));
    if (selectedService) {
      setFormData(prev => ({ ...prev, amount: selectedService.price.toString() }));
    }
  };

  const handlePaymentMethodChange = (value: string) => {
    setFormData(prev => ({ ...prev, payment_method: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.service_id || !formData.amount || !formData.due_date) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    try {
      setLoading(true);
      
      const paymentData = {
        client_id: clientId,
        service_id: parseInt(formData.service_id),
        amount: parseFloat(formData.amount),
        due_date: formData.due_date,
        payment_method: formData.payment_method,
        notes: formData.notes,
        status: 'pending',
      };
      
      await paymentsDb.create(paymentData);
      
      // Limpar formulário
      setFormData({
        service_id: '',
        amount: '',
        due_date: new Date().toISOString().split('T')[0],
        payment_method: 'Transferência',
        notes: ''
      });
      
      toast.success('Pagamento adicionado com sucesso');
      onPaymentAdded();
    } catch (error) {
      console.error('Error adding payment:', error);
      toast.error('Erro ao adicionar pagamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-md">
      <h3 className="text-lg font-medium">Adicionar Novo Pagamento</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="service_id">Serviço</Label>
          <Select value={formData.service_id} onValueChange={handleServiceChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um serviço" />
            </SelectTrigger>
            <SelectContent>
              {services.length > 0 ? (
                services.map((service) => (
                  <SelectItem key={service.id} value={service.id.toString()}>
                    {service.service_type} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price)}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>Nenhum serviço disponível</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="amount">Valor</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="due_date">Data de Vencimento</Label>
          <Input
            id="due_date"
            name="due_date"
            type="date"
            value={formData.due_date}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="payment_method">Método de Pagamento</Label>
          <Select value={formData.payment_method} onValueChange={handlePaymentMethodChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o método" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Transferência">Transferência</SelectItem>
              <SelectItem value="PIX">PIX</SelectItem>
              <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
              <SelectItem value="Boleto">Boleto</SelectItem>
              <SelectItem value="Dinheiro">Dinheiro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Input
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Observações adicionais (opcional)"
        />
      </div>
      
      <Button type="submit" disabled={loading} className="w-full">
        <PlusCircle className="mr-2 h-4 w-4" />
        {loading ? 'Adicionando...' : 'Adicionar Pagamento'}
      </Button>
    </form>
  );
};

export default AddPaymentForm;
