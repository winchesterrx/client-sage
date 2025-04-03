
import React from 'react';
import { Service } from '@/types/database';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/formatters';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

interface ClientServicesTableProps {
  services: Service[];
}

const ClientServicesTable: React.FC<ClientServicesTableProps> = ({ services }) => {
  if (services.length === 0) {
    return <p className="text-muted-foreground text-center py-4">Nenhum serviço encontrado para este cliente.</p>;
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo de Serviço</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => (
            <TableRow key={service.id}>
              <TableCell className="font-medium">{service.service_type}</TableCell>
              <TableCell>{formatCurrency(service.price)}</TableCell>
              <TableCell>
                <Badge
                  className={
                    service.status === 'active'
                      ? 'bg-green-500'
                      : service.status === 'inactive'
                      ? 'bg-red-500'
                      : 'bg-yellow-500'
                  }
                >
                  {service.status === 'active'
                    ? 'Ativo'
                    : service.status === 'inactive'
                    ? 'Inativo'
                    : 'Pendente'}
                </Badge>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/services/${service.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Detalhes
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClientServicesTable;
