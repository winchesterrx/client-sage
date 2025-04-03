
import React from 'react';
import { Payment } from '@/types/database';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Eye, CheckCircle } from 'lucide-react';
import { paymentsDb } from '@/lib/supabase/database/payments';
import { toast } from 'sonner';

interface ClientPaymentsTableProps {
  payments: Payment[];
  onPaymentUpdated: () => void;
}

const ClientPaymentsTable: React.FC<ClientPaymentsTableProps> = ({ payments, onPaymentUpdated }) => {
  if (payments.length === 0) {
    return <p className="text-muted-foreground text-center py-4">Nenhum pagamento encontrado para este cliente.</p>;
  }

  const handleMarkAsPaid = async (id: number) => {
    try {
      await paymentsDb.markAsPaid(id);
      onPaymentUpdated();
    } catch (error) {
      console.error('Error marking payment as paid:', error);
      toast.error('Erro ao marcar pagamento como pago');
    }
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Valor</TableHead>
            <TableHead>Data de Vencimento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Método de Pagamento</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
              <TableCell>{formatDate(payment.due_date)}</TableCell>
              <TableCell>
                <Badge
                  className={
                    payment.status === 'paid'
                      ? 'bg-green-500'
                      : payment.status === 'overdue'
                      ? 'bg-red-500'
                      : 'bg-yellow-500'
                  }
                >
                  {payment.status === 'paid'
                    ? 'Pago'
                    : payment.status === 'overdue'
                    ? 'Atrasado'
                    : 'Pendente'}
                </Badge>
              </TableCell>
              <TableCell>{payment.payment_method || '-'}</TableCell>
              <TableCell className="flex gap-2">
                {payment.status !== 'paid' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleMarkAsPaid(payment.id)}
                    className="text-green-600 border-green-600 hover:bg-green-50"
                  >
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Marcar como Pago
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClientPaymentsTable;
