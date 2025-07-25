import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Crown, MessageCircle, Heart, Share2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import EnhancedAnimatedBackground from '@/components/EnhancedAnimatedBackground';
import SocialMessagingModal from '@/components/SocialMessagingModal';

interface RegisteredUser {
  name: string;
  email: string;
  profileImage?: string;
  description?: string;
}

const Community = () => {
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [currentUser, setCurrentUser] = useState<RegisteredUser | null>(null);
  const [selectedUser, setSelectedUser] = useState<RegisteredUser | null>(null);
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Get all registered users from localStorage
    const users = localStorage.getItem('registeredUsers');
    if (users) {
      const allUsers = JSON.parse(users);
      console.log('All registered users from localStorage:', allUsers);
      setRegisteredUsers(allUsers);
    }

    // Get current logged-in user
    const loggedInUser = localStorage.getItem('currentUser');
    if (loggedInUser) {
      const user = JSON.parse(loggedInUser);
      setCurrentUser(user);
      // Mark current user as online
      setOnlineUsers(prev => new Set([...prev, user.email]));
      
      // Update last seen timestamp
      const now = Date.now();
      localStorage.setItem(`lastSeen_${user.email}`, now.toString());
    }

    // Listen for storage changes
    const handleStorageChange = () => {
      const updatedUsers = localStorage.getItem('registeredUsers');
      setRegisteredUsers(updatedUsers ? JSON.parse(updatedUsers) : []);
    };

    // Update online status periodically
    const updateOnlineStatus = () => {
      const now = Date.now();
      const fiveMinutesAgo = now - (5 * 60 * 1000); // 5 minutes threshold
      const newOnlineUsers = new Set<string>();

      // Check all registered users for recent activity
      registeredUsers.forEach(user => {
        const lastSeen = localStorage.getItem(`lastSeen_${user.email}`);
        if (lastSeen && parseInt(lastSeen) > fiveMinutesAgo) {
          newOnlineUsers.add(user.email);
        }
      });

      setOnlineUsers(newOnlineUsers);
    };

    // Update online status every 30 seconds
    const intervalId = setInterval(updateOnlineStatus, 30000);

    // Update current user's timestamp every 2 minutes
    const heartbeatId = setInterval(() => {
      if (currentUser) {
        const now = Date.now();
        localStorage.setItem(`lastSeen_${currentUser.email}`, now.toString());
      }
    }, 120000); // 2 minutes

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userRegistered', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userRegistered', handleStorageChange);
      clearInterval(intervalId);
      clearInterval(heartbeatId);
    };
  }, [registeredUsers, currentUser]);

  const handleSendMessage = (user: RegisteredUser) => {
    setSelectedUser(user);
    setIsMessagingOpen(true);
  };

  const getLastMessageTime = (userEmail: string) => {
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    const userMessages = messages.filter((msg: any) => 
      msg.senderId === userEmail || msg.receiverId === userEmail
    );
    if (userMessages.length > 0) {
      const lastMessage = userMessages[userMessages.length - 1];
      return new Date(lastMessage.timestamp).toLocaleDateString('ar-SA');
    }
    return null;
  };

  const isUserOnline = (userEmail: string) => {
    return onlineUsers.has(userEmail);
  };

  const getOnlineCount = () => {
    return onlineUsers.size;
  };

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-x-hidden">
      <EnhancedAnimatedBackground />
      
      <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Link to="/website" className="inline-flex items-center text-white hover:text-neon-cyan transition-colors mb-8 font-arabic">
            <ArrowLeft className="mr-2" size={20} />
            العودة للصفحة الرئيسية
          </Link>
          
          <div className="text-center mb-12">
            <h1 className="font-orbitron font-bold text-4xl sm:text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-6">
              مجتمع العقول الرقمية
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto font-arabic">
              تواصل مع جميع أعضاء النادي واستمتع بتجربة التواصل الاجتماعي
            </p>
            <div className="mt-6 flex justify-center items-center space-x-4 rtl:space-x-reverse">
              <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-full px-4 py-2">
                <span className="text-neon-cyan font-bold font-arabic">
                  {registeredUsers.length} عضو نشط
                </span>
              </div>
              <div className="bg-gray-800/40 backdrop-blur-sm border border-green-500/50 rounded-full px-4 py-2">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 font-bold font-arabic">
                    {getOnlineCount()} متصل الآن
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {registeredUsers.length === 0 ? (
            <div className="text-center py-20">
              <Users size={80} className="text-gray-500 mx-auto mb-6" />
              <h2 className="text-2xl text-gray-400 mb-4 font-arabic">
                لا يوجد أعضاء مسجلين بعد
              </h2>
              <p className="text-gray-500 mb-8 font-arabic">
                كن أول من ينضم إلى مجتمعنا الرقمي
              </p>
              {!currentUser && (
                <Link to="/register">
                  <Button className="bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-purple hover:from-neon-purple hover:via-neon-blue hover:to-neon-cyan text-black font-bold py-4 px-8 rounded-full neon-glow transition-all duration-500 transform hover:scale-110 text-lg font-arabic">
                    انضم إلى المجتمع
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registeredUsers.map((user, index) => {
                const lastMessageTime = getLastMessageTime(user.email);
                const isCurrentUser = currentUser && currentUser.email === user.email;
                const userIsOnline = isUserOnline(user.email);
                
                return (
                  <div key={index} className="bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 hover:border-neon-cyan transition-all duration-500 transform hover:scale-105 relative">
                    {/* Online Badge */}
                    {userIsOnline && (
                      <div className="absolute -top-2 -right-2 z-10">
                        <Badge className="bg-green-500 hover:bg-green-600 text-white border-0 shadow-lg animate-pulse">
                          <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
                          متصل
                        </Badge>
                      </div>
                    )}

                    <div className="text-center">
                      <div className="relative mb-4 mx-auto w-20 h-20">
                        <Avatar className="w-full h-full border-2 border-neon-cyan/50 hover:border-neon-cyan transition-colors">
                          {user.profileImage ? (
                            <AvatarImage src={user.profileImage} alt={user.name} />
                          ) : (
                            <AvatarFallback className="bg-gradient-to-r from-neon-cyan to-neon-purple text-white text-lg font-bold">
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        {isCurrentUser && (
                          <div className="absolute -top-2 -right-2 bg-yellow-500 text-black rounded-full p-1">
                            <Crown size={12} />
                          </div>
                        )}
                        {/* Online Status Indicator */}
                        <div className={`absolute -bottom-1 -left-1 w-4 h-4 border-2 border-gray-800 rounded-full ${
                          userIsOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                        }`}></div>
                      </div>
                      
                      <h3 className="text-white font-bold text-lg mb-2 font-arabic">
                        {user.name}
                        {isCurrentUser && (
                          <span className="text-yellow-400 text-sm block">(أنت)</span>
                        )}
                      </h3>
                      
                      <p className="text-neon-cyan text-sm mb-3">
                        {user.email}
                      </p>
                      
                      {user.description && (
                        <p className="text-gray-300 text-xs mb-4 font-arabic line-clamp-2">
                          {user.description}
                        </p>
                      )}

                      {/* Online Status Text */}
                      <div className="mb-3">
                        {userIsOnline ? (
                          <span className="text-green-400 text-xs font-bold font-arabic">
                            متصل الآن
                          </span>
                        ) : (
                          lastMessageTime && !isCurrentUser && (
                            <p className="text-gray-500 text-xs font-arabic">
                              آخر نشاط: {lastMessageTime}
                            </p>
                          )
                        )}
                      </div>

                      {/* Social Actions */}
                      <div className="flex justify-center space-x-2 rtl:space-x-reverse mb-4">
                        {currentUser && !isCurrentUser && (
                          <>
                            <Button
                              onClick={() => handleSendMessage(user)}
                              size="sm"
                              className="bg-gradient-to-r from-neon-blue to-neon-purple hover:from-neon-purple hover:to-neon-blue text-white font-bold py-2 px-3 rounded-full transition-all duration-300"
                            >
                              <MessageCircle size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-gray-400 hover:text-red-400 transition-colors"
                            >
                              <Heart size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-gray-400 hover:text-blue-400 transition-colors"
                            >
                              <Share2 size={14} />
                            </Button>
                          </>
                        )}
                      </div>

                      <div className="px-3 py-1 bg-gradient-to-r from-neon-cyan/20 to-neon-blue/20 border border-neon-cyan/30 rounded-full">
                        <span className="text-neon-cyan text-xs font-semibold font-arabic">
                          {isCurrentUser ? 'حسابك' : 'عضو نشط'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {!currentUser && registeredUsers.length > 0 && (
            <div className="text-center mt-12">
              <Link to="/register">
                <Button className="bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-purple hover:from-neon-purple hover:via-neon-blue hover:to-neon-cyan text-black font-bold py-4 px-8 rounded-full neon-glow transition-all duration-500 transform hover:scale-110 text-lg font-arabic">
                  انضم إلى المجتمع
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Social Messaging Modal */}
      {currentUser && selectedUser && (
        <SocialMessagingModal
          isOpen={isMessagingOpen}
          onClose={() => setIsMessagingOpen(false)}
          recipient={selectedUser}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default Community;
