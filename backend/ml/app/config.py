"""
Configuration management for ML Service
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Server Configuration
    port: int = 8000
    host: str = "0.0.0.0"
    log_level: str = "INFO"

    # Model Configuration
    model_path: str = "./models"
    cache_ttl: int = 300  # seconds

    # Clustering Parameters (DBSCAN)
    dbscan_eps: float = 0.001  # ~100 meters in degrees
    dbscan_min_samples: int = 3

    # Risk Scoring Weights (optimized for better variation)
    weight_incident_density: float = 0.5  # Increased - density is most important
    weight_recency: float = 0.25  # Slightly decreased
    weight_severity: float = 0.15  # Decreased
    weight_time_pattern: float = 0.1  # Keep same

    # Heatmap Configuration
    default_grid_size: int = 100  # meters per cell
    default_radius: int = 1000  # meters

    # Retraining Configuration
    auto_retrain_threshold: float = 0.1  # 10% new incidents
    min_retrain_interval: int = 3600  # seconds

    # Database Configuration
    db_host: str = "localhost"
    db_port: int = 5433
    db_name: str = "women_safety_db"
    db_user: str = "postgres"
    db_password: str = ""
    db_ssl: bool = False

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        protected_namespaces = ("settings_",)


# Global settings instance
settings = Settings()

