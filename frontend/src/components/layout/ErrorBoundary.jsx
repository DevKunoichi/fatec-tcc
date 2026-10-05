import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Erro capturado pelo ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 text-center">
          <h1 className="text-2xl font-bold text-[#16295B]">Algo deu errado nesta tela</h1>
          <p className="text-gray-600 mt-2">
            Ocorreu um erro inesperado. Tente recarregar a página.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;