import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('custom_users') || '[]');
    if (users.find((u: any) => u.email === email)) {
      setError('Email já cadastrado');
      setSuccess('');
      return;
    }
    users.push({ name, email, password });
    localStorage.setItem('custom_users', JSON.stringify(users));
    setSuccess('Conta criada com sucesso!');
    setError('');
    setTimeout(() => navigate('/dashboard'), 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-sm space-y-4">
        <h2 className="text-2xl font-bold mb-4">Criar Conta</h2>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <div>
          <label className="block text-sm font-medium mb-1">Nome</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Senha</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border rounded px-3 py-2" required />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700">Cadastrar</button>
        <p className="text-sm mt-2">Já tem conta? <a href="/login" className="text-blue-600 underline">Entrar</a></p>
      </form>
    </div>
  );
};

export default RegisterPage; 