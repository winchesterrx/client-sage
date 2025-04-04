
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/supabase/auth';
import { toast } from 'sonner';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({});
    
    // Front-end validation
    if (!name || !email || !password || !passwordConfirm) {
      setErrors(prev => ({ ...prev, general: "Todos os campos são obrigatórios" }));
      return;
    }
    
    if (password !== passwordConfirm) {
      setErrors(prev => ({ ...prev, passwordConfirm: "As senhas não conferem" }));
      return;
    }
    
    try {
      setLoading(true);
      
      // Use auth.register - remove the 'active' property since it's not expected in the parameter
      const result = await auth.register({
        name,
        email,
        password,
        role: "user", // Specify role as a literal type
        invitation_status: "pending"
        // Removed the 'active' property
      });
      
      if (result.success) {
        // Show success message after registration
        toast(result.message);
        
        // Navigate to login after short delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        // Show error message
        setErrors(prev => ({ ...prev, general: result.message }));
      }
      
    } catch (error: any) {
      console.error("Registration error:", error);
      setErrors(prev => ({ 
        ...prev, 
        general: "Erro ao registrar usuário. Verifique os dados e tente novamente." 
      }));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Criar uma conta</CardTitle>
          <CardDescription>
            Insira seus dados para criar uma nova conta
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              type="text"
              placeholder="Seu nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="passwordConfirm">Confirmar Senha</Label>
            <Input
              id="passwordConfirm"
              type="password"
              placeholder="Confirmar Senha"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
            {errors.passwordConfirm && <p className="text-red-500 text-sm">{errors.passwordConfirm}</p>}
          </div>
          {errors.general && <p className="text-red-500 text-sm">{errors.general}</p>}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button disabled={loading} onClick={(e) => handleSubmit(e as any as React.FormEvent<HTMLFormElement>)} type="submit">
            {loading ? "Criando conta..." : "Criar conta"}
          </Button>
          <p className="text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link to="/login" className="text-primary">
              Faça login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
