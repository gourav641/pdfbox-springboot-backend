package com.DocuFlow.DocuFlow.Entity;

import lombok.*;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.io.File;
import java.time.LocalDateTime;

@Document(collection = "files_uploaded")
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Entity {
    @Id
    private ObjectId id;
    private String filename;


}
