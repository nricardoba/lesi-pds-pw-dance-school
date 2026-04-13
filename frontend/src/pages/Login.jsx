import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    login("token_falso_para_teste");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex justify-center focus:outline-none focus:ring-2 focus:ring-blue-500">
      <div className="p-8 w-full max-w-md">
        <div className="flex flex-col items-center inset-x-0 top-0 outline-2 outline-gray-300">
          <div className="bg-[#1C6E8C] rounded-xl w-16 h-16 mb-4 items-center justify-center flex">
            <h2 className="text-[26px] font-bold text-center text-gray-800 text-white">
              E
            </h2>
          </div>
          <h1 className="text-2xl mb-2 font-bold text-center text-gray-800">
            Ent'Artes
          </h1>
          <p className=" text-center text-gray-500 mb-6">
            Sistema de Gestão de Escola de Dança
          </p>
        </div>
        <div className="border shadow-2xl rounded-xl bg-white p-8">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            Bem-vindo de volta
          </h1>
          <p className="text-gray-500 mb-4">Entre com as suas credenciais</p>

          {erro && (
            <p className="text-red-500 text-sm text-center mb-4">{erro}</p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col">
              <p className="text-gray-700 text-sm font-medium mb-2">Email</p>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col">
              <p className="text-gray-700 text-sm font-medium mb-2">Senha</p>
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Lembrar-me</span>
              </label>
              <a href="#" className="text-sm text-blue-500 hover:underline">
                Esqueceu a sua senha?
              </a>
            </div>
            <button
              type="submit"
              className="bg-[#1C6E8C] text-white py-3 rounded-md hover:bg-blue-600 transition-colors font-normal"
            >
              Entrar
            </button>
            <p className="text-center text-gray-500 text-sm mt-2">
              Não tem uma conta?{" "}
              <span
                onClick={() => navigate("/register")}
                className="text-blue-500 cursor-pointer hover:underline"
              >
                Criar conta
              </span>
            </p>
          </form>
        </div>
        <footer className="w-full max-w-md mt-8">
          <p className="text-center text-gray-500 text-sm">
            &copy; 2026 Ent'Artes. Todos os direitos reservados.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Login;
