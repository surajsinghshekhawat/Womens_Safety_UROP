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

    # Density calibration
    # NOTE: risk scoring uses a recency-weighted "effective incident count", not raw count.
    # This value is the approximate effective-count that should map to "max density" (1.0).
    # It is intentionally smaller than raw-count thresholds because old incidents decay.
    max_expected_effective_incidents: float = 10.0

    # Recency calibration
    # Controls how quickly old incidents "fade out" of risk calculations.
    # 30 days keeps multi-week patterns relevant while making ~1 year incidents negligible.
    recency_decay_days: float = 30.0

    # Time-of-day similarity calibration (for time-dependent hotspots)
    # Controls how strongly incidents "match" the current local time-of-day.
    # Smaller sigma -> sharper time dependence (e.g., only incidents within ~2-3 hours matter).
    time_of_day_sigma_hours: float = 3.0
    # Minimum time-of-day weight to avoid hard zeroing (keeps a small residual influence).
    time_of_day_min_weight: float = 0.05

    # Heatmap Configuration
    default_grid_size: int = 100  # meters per cell
    default_radius: int = 1000  # meters

    # Land / city boundary masking (GeoJSON polygon containment)
    land_mask_enabled: bool = True
    # Path to a GeoJSON file used for masking.
    # Default is the Datameet Chennai ward polygons GeoJSON (downloaded on first use).
    land_mask_geojson_path: str = "resources/landmask/chennai_wards.geojson"
    # Source URL used only if the GeoJSON file is missing.
    # Default: Datameet Chennai ward polygons.
    land_mask_source_url: str = (
        "https://raw.githubusercontent.com/datameet/Municipal_Spatial_Data/master/Chennai/Wards.geojson"
    )
    # NOTE: If you provide your own city boundary GeoJSON (single polygon),
    # set LAND_MASK_GEOJSON_PATH accordingly and you can remove the need for ward unions.

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

