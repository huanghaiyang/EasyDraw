package com.easydraw.service;

import com.easydraw.dto.ElementDto;
import com.easydraw.entity.Element;
import com.easydraw.repository.ElementRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ElementServiceTest {

    @Mock
    private ElementRepository elementRepository;

    @InjectMocks
    private ElementService elementService;

    private Element element;
    private UUID elementId;
    private UUID boardId;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        elementId = UUID.randomUUID();
        boardId = UUID.randomUUID();
        element = new Element();
        element.setId(elementId);
        element.setBoardId(boardId);
        element.setType("rectangle");
        element.setName("Test Element");
        Map<String, Object> data = new HashMap<>();
        data.put("x", 100);
        data.put("y", 100);
        data.put("width", 200);
        data.put("height", 150);
        element.setData(data);
        element.setCreatedAt(LocalDateTime.now());
        element.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    void createElement() {
        Map<String, Object> data = new HashMap<>();
        data.put("type", "rectangle");
        data.put("name", "Test Element");
        data.put("x", 100);
        data.put("y", 100);
        data.put("width", 200);
        data.put("height", 150);

        when(elementRepository.save(any(Element.class))).thenReturn(element);

        ElementDto result = elementService.createElement(boardId.toString(), data);

        assertNotNull(result);
        assertEquals("rectangle", result.getType());
        assertEquals("Test Element", result.getName());
        verify(elementRepository, times(1)).save(any(Element.class));
    }

    @Test
    void createElementWithNullType() {
        Map<String, Object> data = new HashMap<>();
        data.put("name", "Test Element");
        data.put("x", 100);
        data.put("y", 100);
        data.put("width", 200);
        data.put("height", 150);

        // 创建一个新的Element对象，type为unknown
        Element elementWithUnknownType = new Element();
        elementWithUnknownType.setId(elementId);
        elementWithUnknownType.setBoardId(boardId);
        elementWithUnknownType.setType("unknown");
        elementWithUnknownType.setName("Test Element");
        elementWithUnknownType.setData(data);
        elementWithUnknownType.setCreatedAt(LocalDateTime.now());
        elementWithUnknownType.setUpdatedAt(LocalDateTime.now());

        when(elementRepository.save(any(Element.class))).thenReturn(elementWithUnknownType);

        ElementDto result = elementService.createElement(boardId.toString(), data);

        assertNotNull(result);
        assertEquals("unknown", result.getType());
        verify(elementRepository, times(1)).save(any(Element.class));
    }

    @Test
    void createElementWithNullName() {
        Map<String, Object> data = new HashMap<>();
        data.put("type", "rectangle");
        data.put("x", 100);
        data.put("y", 100);
        data.put("width", 200);
        data.put("height", 150);

        // 创建一个新的Element对象，name为untitled
        Element elementWithUntitledName = new Element();
        elementWithUntitledName.setId(elementId);
        elementWithUntitledName.setBoardId(boardId);
        elementWithUntitledName.setType("rectangle");
        elementWithUntitledName.setName("untitled");
        elementWithUntitledName.setData(data);
        elementWithUntitledName.setCreatedAt(LocalDateTime.now());
        elementWithUntitledName.setUpdatedAt(LocalDateTime.now());

        when(elementRepository.save(any(Element.class))).thenReturn(elementWithUntitledName);

        ElementDto result = elementService.createElement(boardId.toString(), data);

        assertNotNull(result);
        assertEquals("untitled", result.getName());
        verify(elementRepository, times(1)).save(any(Element.class));
    }

    @Test
    void updateElement() {
        Map<String, Object> data = new HashMap<>();
        data.put("id", elementId.toString());
        data.put("type", "circle");
        data.put("name", "Updated Element");
        data.put("x", 150);
        data.put("y", 150);
        data.put("radius", 100);

        when(elementRepository.findById(elementId)).thenReturn(Optional.of(element));
        when(elementRepository.save(any(Element.class))).thenReturn(element);

        ElementDto result = elementService.updateElement(boardId.toString(), data);

        assertNotNull(result);
        assertEquals("circle", result.getType());
        assertEquals("Updated Element", result.getName());
        verify(elementRepository, times(1)).findById(elementId);
        verify(elementRepository, times(1)).save(any(Element.class));
    }

    @Test
    void updateElementNotFound() {
        Map<String, Object> data = new HashMap<>();
        data.put("id", elementId.toString());
        data.put("type", "circle");
        data.put("name", "Updated Element");

        when(elementRepository.findById(elementId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> 
            elementService.updateElement(boardId.toString(), data)
        );
        verify(elementRepository, times(1)).findById(elementId);
    }

    @Test
    void deleteElement() {
        when(elementRepository.existsById(elementId)).thenReturn(true);

        elementService.deleteElement(boardId.toString(), elementId.toString());

        verify(elementRepository, times(1)).deleteById(elementId);
    }

    @Test
    void getElement() {
        when(elementRepository.findById(elementId)).thenReturn(Optional.of(element));

        ElementDto result = elementService.getElement(boardId.toString(), elementId.toString());

        assertNotNull(result);
        assertEquals(elementId.toString(), result.getId());
        verify(elementRepository, times(1)).findById(elementId);
    }

    @Test
    void getElementNotFound() {
        when(elementRepository.findById(elementId)).thenReturn(Optional.empty());

        ElementDto result = elementService.getElement(boardId.toString(), elementId.toString());

        assertNull(result);
        verify(elementRepository, times(1)).findById(elementId);
    }

}
