from pydantic import BaseModel, HttpUrl, Field, field_validator
from typing import Optional
from datetime import datetime
import re

class BookmarkCreate(BaseModel):
    url: str = Field(..., min_length=1, description="URL cannot be empty")
    title: str = Field(max_length=500, description="Title max 500 characters")
    description: Optional[str] = Field(default="", max_length=2000, description="Description max 2000 characters")
    
    @field_validator('url')
    @classmethod
    def validate_url(cls, v):
        if not v or not v.strip():
            raise ValueError('URL cannot be empty')
        
        # Basic URL pattern validation
        url_pattern = re.compile(
            r'^(?:http[s]?://)?'  # optional scheme
            r'(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'  # domain
        )
        
        # Check if it looks like a valid URL
        if not url_pattern.match(v.strip()):
            raise ValueError('Invalid URL format')
        
        # Ensure there's some domain-like content
        normalized = v.strip()
        if not normalized.startswith(('http://', 'https://')):
            normalized = 'http://' + normalized
        
        # Basic check for domain structure
        if '.' not in normalized.split('://')[1].split('/')[0]:
            raise ValueError('URL must contain a valid domain')
            
        return v.strip()

class BookmarkUpdate(BaseModel):
    url: Optional[str] = Field(None, min_length=1, description="URL cannot be empty")
    title: Optional[str] = Field(None, max_length=500, description="Title max 500 characters")
    description: Optional[str] = Field(None, max_length=2000, description="Description max 2000 characters")
    
    @field_validator('url')
    @classmethod
    def validate_url(cls, v):
        if v is not None:
            if not v or not v.strip():
                raise ValueError('URL cannot be empty')
            
            # Basic URL pattern validation
            url_pattern = re.compile(
                r'^(?:http[s]?://)?'  # optional scheme
                r'(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'  # domain
            )
            
            # Check if it looks like a valid URL
            if not url_pattern.match(v.strip()):
                raise ValueError('Invalid URL format')
            
            # Ensure there's some domain-like content
            normalized = v.strip()
            if not normalized.startswith(('http://', 'https://')):
                normalized = 'http://' + normalized
            
            # Basic check for domain structure
            if '.' not in normalized.split('://')[1].split('/')[0]:
                raise ValueError('URL must contain a valid domain')
                
        return v.strip() if v else v

class BookmarkResponse(BaseModel):
    id: int
    url: str
    title: str
    description: str
    favicon_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class FetchTitleRequest(BaseModel):
    url: str

class FetchTitleResponse(BaseModel):
    title: str
    favicon_url: Optional[str] = None