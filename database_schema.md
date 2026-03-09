# TrackMate - PostgreSQL Veritabanı Şeması

Bu belge, TrackMate platformu için Kullanıcılar, Rotalar, Tercihler ve Mekanlar arasındaki ilişkiyi kuran temel veritabanı tasarımını içermektedir.

## Varlık İlişki (ER) Diyagramı

Aşağıdaki diyagramda tablolar arasındaki bire-çok ve çoka-çok ilişkiler özetlenmiştir.

```mermaid
erDiagram
    users ||--o{ preferences : "has"
    users ||--o{ routes : "creates"
    routes ||--|{ route_places : "contains"
    places ||--o{ route_places : "included_in"

    users {
        uuid id PK
        string username
        string email
        string password_hash
        timestamp created_at
    }
    
    preferences {
        uuid id PK
        uuid user_id FK
        string title
        decimal max_budget
        int max_duration_mins
        jsonb preferred_categories
        timestamp created_at
    }

    places {
        uuid id PK
        string external_id "Google/Foursquare ID"
        string name
        decimal latitude
        decimal longitude
        string category
        int price_level
        decimal rating
        int estimated_time_mins "Örn: 90 dk"
    }

    routes {
        uuid id PK
        uuid user_id FK
        string name
        date planned_date
        int total_duration_mins
        decimal total_cost_estimate
        timestamp created_at
    }

    route_places {
        uuid id PK
        uuid route_id FK
        uuid place_id FK
        int step_order "Rotadaki sırası (1, 2, 3...)"
        time arrival_time
        time departure_time
        int travel_time_from_prev "Önceki konumdan geliş süresi"
    }
```

