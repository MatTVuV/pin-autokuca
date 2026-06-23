import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const roles = JSON.parse(localStorage.getItem('roles'));
    const username = localStorage.getItem('username');

    if (token && roles) {
      setUser({ token, roles, username });
    }
    setLoading(false);
  }, []);

  const login = (token, roles, username) => {
    localStorage.setItem('token', token);
    localStorage.setItem('roles', JSON.stringify(roles));
    localStorage.setItem('username', username);
    setUser({ token, roles, username });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('roles');
    localStorage.removeItem('username');
    setUser(null);
  };

  const isAdmin = () => {
    return user && user.roles.includes('Admin');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};