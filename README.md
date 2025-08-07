# OAuth & JWT Workshop

## 🎯 Workshop Overview

Learn OAuth 2.0 and JWT authentication with a simple API:

- **OAuth 2.0** - Client credentials flow
- **JWT** - JSON Web Tokens (1 minute expiration)
- **PostgreSQL** - Store OAuth clients (Phase 2)
- **Redis** - Store JWT tokens (Phase 2)

## 🚀 Getting Started

```bash
npm install
npm run dev
```

## 📋 Workshop Phases

### Phase 1: Basic Implementation (Required)

#### 1. OAuth Client Credentials Flow
- [ ] Create `oauth.txt` file to sto.re client_id and client_secret pairs
- [ ] Implement `POST /oauth/token` endpoint
- [ ] Read client_id and client_secret from request headers
- [ ] Validate against `oauth.txt` file
- [ ] Generate JWT token with 1-minute expiration
- [ ] Store JWT token in `jwt.txt` file with expiry timestamp

#### 2. JWT Validation Endpoint
- [ ] Implement `GET /data` endpoint
- [ ] Read JWT token from Authorization header
- [ ] Validate JWT token and check expiration
- [ ] Return mock data if token is valid

#### Required Endpoints:
- `POST /oauth/token` - OAuth token endpoint
- `GET /data` - Get mock data (requires JWT)

### Phase 2: Advanced Implementation (For the Courageous)

#### 1. Database Integration
- [ ] Set up PostgreSQL
- [ ] Create oauth_clients table
- [ ] Store client_id and client_secret in database
- [ ] Replace `oauth.txt` file with database queries

#### 2. Redis Integration
- [ ] Set up Redis
- [ ] Store JWT tokens in Redis
- [ ] Replace `jwt.txt` file with Redis storage
- [ ] Implement automatic token expiration

## 📁 File Structure

### Phase 1 Files:
- `oauth.txt` - Store client_id:client_secret pairs (one per line)
- `jwt.txt` - Store JWT tokens with expiry timestamps (one per line)

### Example oauth.txt:
```
client_id_1:client_secret_1
client_id_2:client_secret_2
client_id_3:client_secret_3
```

### Example jwt.txt:
```
jwt_token_1:expiry_timestamp_1
jwt_token_2:expiry_timestamp_2
jwt_token_3:expiry_timestamp_3
```

---

**Happy coding! 🎉** 